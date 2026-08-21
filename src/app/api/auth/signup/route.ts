import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  emailVerificationTokens,
} from "@/db/schema";

import { hashPassword } from "@/lib/auth";

import {
  normalizeEmail,
  isValidEmail,
} from "@/lib/validation";

import {
  validatePasswordStrength,
} from "@/lib/passwordValidation";

import {
  generateVerificationToken,
  getTokenExpiry,
} from "@/lib/token";

import {
  sendVerificationEmail,
} from "@/lib/email";

export async function POST(
  request: Request
) {
  let createdUserId:
    | string
    | undefined;

  try {
    const body =
      await request.json();

    let {
      displayName,
      email,
      password,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | 1. Required fields
    |--------------------------------------------------------------------------
    */

    if (
      !displayName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          message:
            "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Normalize input
    |--------------------------------------------------------------------------
    */

    displayName =
      displayName.trim();

    email =
      normalizeEmail(email);

    /*
    |--------------------------------------------------------------------------
    | 3. Validate display name
    |--------------------------------------------------------------------------
    */

    if (
      displayName.length < 2
    ) {
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

    /*
    |--------------------------------------------------------------------------
    | 4. Validate email
    |--------------------------------------------------------------------------
    */

    if (
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Validate password strength
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | This is now handled by the shared password validator.
    |
    | The same validator will also be used for:
    |
    | - Change Password
    | - Forgot Password / Reset Password
    |
    */

    const passwordError =
      validatePasswordStrength(
        password
      );

    if (passwordError) {
      return NextResponse.json(
        {
          message:
            passwordError,
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Check whether email already exists
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await db.query.users.findFirst({
        where: (
          users,
          { eq }
        ) =>
          eq(
            users.email,
            email
          ),
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "Email already registered.",
        },
        {
          status: 409,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Hash password
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await hashPassword(
        password
      );

    /*
    |--------------------------------------------------------------------------
    | 8. Generate email verification token
    |--------------------------------------------------------------------------
    */

    const verificationToken =
      generateVerificationToken();

    /*
    |--------------------------------------------------------------------------
    | 9. Create user + verification token
    |--------------------------------------------------------------------------
    */

    const createdUser =
      await db.transaction(
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
                id:
                  users.id,

                email:
                  users.email,
              });

          createdUserId =
            insertedUsers[0].id;

          await tx
            .insert(
              emailVerificationTokens
            )
            .values({
              userId:
                insertedUsers[0].id,

              token:
                verificationToken,

              expiresAt:
                getTokenExpiry(),
            });

          return insertedUsers[0];
        }
      );

    /*
    |--------------------------------------------------------------------------
    | 10. Send verification email
    |--------------------------------------------------------------------------
    */

    try {
      await sendVerificationEmail(
        createdUser.email,
        verificationToken
      );
    } catch (
      emailError
    ) {
      console.error(
        "Email sending failed:",
        emailError
      );

      /*
      |--------------------------------------------------------------------------
      | Roll back manually if email sending fails.
      |--------------------------------------------------------------------------
      */

      if (createdUserId) {
        await db
          .delete(
            emailVerificationTokens
          )
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

    /*
    |--------------------------------------------------------------------------
    | 11. Success
    |--------------------------------------------------------------------------
    */

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
