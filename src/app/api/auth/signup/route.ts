import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { normalizeEmail, isValidEmail } from "@/lib/validation";
import { generateVerificationToken, getTokenExpiry } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    let {
      displayName,
      email,
      password,
    } = body;


    // Check required fields
    if (!displayName || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }


    // Clean inputs
    displayName = displayName.trim();
    email = normalizeEmail(email);


    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Invalid email address",
        },
        {
          status: 400,
        }
      );
    }


    // Password rules
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }


    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) =>
        eq(users.email, email),
    });


    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already registered",
        },
        {
          status: 409,
        }
      );
    }


    const passwordHash = await hashPassword(password);


    const newUser = await db
      .insert(users)
      .values({
        displayName,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
      });


    // Create email verification token
    const verificationToken = generateVerificationToken();


    await db.insert(emailVerificationTokens).values({
      userId: newUser[0].id,
      token: verificationToken,
      expiresAt: getTokenExpiry(),
    });


    // Send verification email
    await sendVerificationEmail(
      newUser[0].email,
      verificationToken
    );


    return NextResponse.json(
      {
        message: "Account created. Please check your email to verify your account.",
        user: newUser[0],
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
        }
