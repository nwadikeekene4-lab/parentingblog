import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { normalizeEmail, isValidEmail } from "@/lib/validation";
import {
  generateVerificationToken,
  getTokenExpiry,
} from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let {
      displayName,
      email,
      password,
    } = body;

    // Required fields
    if (!displayName || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Clean input
    displayName = displayName.trim();
    email = normalizeEmail(email);

    // Display name validation
    if (displayName.length < 2) {
      return NextResponse.json(
        {
          message:
            "Display name must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // Email validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Invalid email address.",
        },
        {
          status: 400,
        }
      );
    }

    // Strong password validation
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strongPassword.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
        },
        {
          status: 400,
        }
      );
    }

    // Check for existing account
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) =>
        eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already registered.",
        },
        {
          status: 409,
        }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        displayName,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
      });

    // Generate verification token
    const verificationToken =
      generateVerificationToken();

    // Save verification token
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
        message:
          "Account created successfully. Please check your email to verify your account.",
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error("Signup error:", error);

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}
