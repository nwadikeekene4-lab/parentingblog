import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  passwordResetTokens,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Read request body safely
    |--------------------------------------------------------------------------
    */

    let body: {
      email?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Validate email
    |--------------------------------------------------------------------------
    */

    if (
      typeof body.email !== "string" ||
      !body.email.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Please enter your email address.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      body.email.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Basic email validation
    |--------------------------------------------------------------------------
    */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return NextResponse.json(
        {
          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Find account
    |--------------------------------------------------------------------------
    */

    const user =
      await db.query.users.findFirst({
        where: eq(
          users.email,
          normalizedEmail
        ),
      });

    /*
    |--------------------------------------------------------------------------
    | 4. Account does not exist
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return NextResponse.json(
        {
          message:
            "No account was found with this email address. Please check the email and try again.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Make sure the account is active
    |--------------------------------------------------------------------------
    */

    if (!user.isActive) {
      return NextResponse.json(
        {
          message:
            "This account is currently inactive. Please contact support for assistance.",
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Remove previous reset tokens
    |--------------------------------------------------------------------------
    |
    | This prevents multiple old reset links from remaining active.
    |--------------------------------------------------------------------------
    */

    await db
      .delete(passwordResetTokens)
      .where(
        eq(
          passwordResetTokens.userId,
          user.id
        )
      );

    /*
    |--------------------------------------------------------------------------
    | 7. Generate secure reset token
    |--------------------------------------------------------------------------
    */

    const token =
      crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
      Date.now() +
        1000 * 60 * 60
    );

    /*
    |--------------------------------------------------------------------------
    | 8. Store reset token
    |--------------------------------------------------------------------------
    */

    await db
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        token,
        expiresAt,
      });

    /*
    |--------------------------------------------------------------------------
    | 9. Send password reset email
    |--------------------------------------------------------------------------
    */

    try {
      await sendPasswordResetEmail(
        user.email,
        token
      );
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError
      );

      /*
      |--------------------------------------------------------------------------
      | Remove the token if the email could not be sent.
      |--------------------------------------------------------------------------
      */

      await db
        .delete(passwordResetTokens)
        .where(
          eq(
            passwordResetTokens.token,
            token
          )
        );

      return NextResponse.json(
        {
          message:
            "We couldn't send the password reset email right now. Please try again in a few moments.",
        },
        {
          status: 503,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 10. Success
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Password reset instructions have been sent to your email address. Please check your inbox and spam folder.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "We couldn't process your request right now. Please try again in a few moments.",
      },
      {
        status: 500,
      }
    );
  }
        }
