import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import {
  passwordResetTokens,
  users,
  sessions,
} from "@/db/schema";

import { eq } from "drizzle-orm";

import { hashPassword } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

function validatePasswordStrength(
  password: string
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`;
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return null;
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Read request body
    |--------------------------------------------------------------------------
    */

    let body: {
      token?: unknown;
      password?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message: "Invalid request.",
        },
        {
          status: 400,
        }
      );
    }

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    /*
    |--------------------------------------------------------------------------
    | 2. Validate required fields
    |--------------------------------------------------------------------------
    */

    if (!token || !password) {
      return NextResponse.json(
        {
          message:
            "Reset token and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Validate password strength
    |--------------------------------------------------------------------------
    */

    const passwordStrengthError =
      validatePasswordStrength(password);

    if (passwordStrengthError) {
      return NextResponse.json(
        {
          message: passwordStrengthError,
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Find reset token
    |--------------------------------------------------------------------------
    */

    const resetToken =
      await db.query.passwordResetTokens.findFirst({
        where: eq(
          passwordResetTokens.token,
          token
        ),
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired reset link.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Check token expiration
    |--------------------------------------------------------------------------
    */

    if (
      new Date() >
      resetToken.expiresAt
    ) {
      await db
        .delete(passwordResetTokens)
        .where(
          eq(
            passwordResetTokens.id,
            resetToken.id
          )
        );

      return NextResponse.json(
        {
          message:
            "Invalid or expired reset link.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Hash new password
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await hashPassword(password);

    /*
    |--------------------------------------------------------------------------
    | 7. Update password and invalidate sessions
    |--------------------------------------------------------------------------
    */

    await db.transaction(async (tx) => {
      /*
      | Update user's password.
      */

      await tx
        .update(users)
        .set({
          passwordHash: hashedPassword,
          updatedAt: new Date(),
        })
        .where(
          eq(
            users.id,
            resetToken.userId
          )
        );

      /*
      | Log out all existing sessions.
      */

      await tx
        .delete(sessions)
        .where(
          eq(
            sessions.userId,
            resetToken.userId
          )
        );

      /*
      | Delete the used reset token.
      */

      await tx
        .delete(passwordResetTokens)
        .where(
          eq(
            passwordResetTokens.id,
            resetToken.id
          )
        );
    });

    /*
    |--------------------------------------------------------------------------
    | 8. Success
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Password reset successful. Please login again.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
      }
