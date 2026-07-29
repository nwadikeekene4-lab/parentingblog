import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

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
  let createdUserId: string | undefined;

  try {
    const body = await request.json();

    let {
      displayName,
      email,
      password,
    } = body;

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

    displayName = displayName.trim();
    email = normalizeEmail(email);

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

    const existingUser =
      await db.query.users.findFirst({
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

    const passwordHash =
      await hashPassword(password);

    const verificationToken =
      generateVerificationToken();

    const createdUser = await db.transaction(
      async (tx) => {

        const insertedUsers =
          await tx
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

        createdUserId =
          insertedUsers[0].id;

        await tx
          .insert(emailVerificationTokens)
          .values({
            userId: insertedUsers[0].id,
            token: verificationToken,
            expiresAt: getTokenExpiry(),
          });

        return insertedUsers[0];
      }
    );

    try {
      await sendVerificationEmail(
        createdUser.email,
        verificationToken
      );
    } catch (emailError) {

      console.error(
        "Email sending failed:",
        emailError
      );

      if (createdUserId) {

        await db
          .delete(emailVerificationTokens)
          .where(
            eq(
              emailVerificationTokens.userId,
              createdUserId
            )
          );

        await db
          .delete(users)
          .where(
            eq(
              users.id,
              createdUserId
            )
          );
      }

      return NextResponse.json(
        {
          message:
            "We couldn't send the verification email. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

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

    console.error(
      "Signup error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
      }
