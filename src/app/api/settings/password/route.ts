import crypto from "crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";

import {
  comparePassword,
  hashPassword,
} from "@/lib/auth";

import { getCurrentUser } from "@/lib/session";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export async function PATCH(request: Request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Verify logged-in user
    |--------------------------------------------------------------------------
    */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Read request body
    |--------------------------------------------------------------------------
    */

    let body: {
      currentPassword?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
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

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    /*
    |--------------------------------------------------------------------------
    | 3. Validate required fields
    |--------------------------------------------------------------------------
    */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          message:
            "Current password, new password, and password confirmation are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Validate new password length
    |--------------------------------------------------------------------------
    */

    if (
      newPassword.length <
      MIN_PASSWORD_LENGTH
    ) {
      return NextResponse.json(
        {
          message:
            `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPassword.length >
      MAX_PASSWORD_LENGTH
    ) {
      return NextResponse.json(
        {
          message:
            `New password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Confirm new password
    |--------------------------------------------------------------------------
    */

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          message:
            "New password and confirmation password do not match.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Verify current password
    |--------------------------------------------------------------------------
    */

    const passwordMatches =
      await comparePassword(
        currentPassword,
        user.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message:
            "Current password is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Prevent reusing the current password
    |--------------------------------------------------------------------------
    */

    const samePassword =
      await comparePassword(
        newPassword,
        user.passwordHash
      );

    if (samePassword) {
      return NextResponse.json(
        {
          message:
            "Your new password must be different from your current password.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 8. Get the current session token
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    const currentSessionToken =
      cookieStore.get("session")?.value;

    if (!currentSessionToken) {
      return NextResponse.json(
        {
          message:
            "Your session has expired. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 9. Create new password hash
    |--------------------------------------------------------------------------
    */

    const newPasswordHash =
      await hashPassword(newPassword);

    /*
    |--------------------------------------------------------------------------
    | 10. Create a new session
    |--------------------------------------------------------------------------
    |
    | All old sessions are removed.
    | A fresh session is then created for the
    | device currently changing the password.
    |
    */

    const newSessionToken =
      crypto.randomBytes(48).toString("hex");

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7
    );

    /*
    |--------------------------------------------------------------------------
    | 11. Update password and replace sessions
    |--------------------------------------------------------------------------
    */

    await db.transaction(async (tx) => {
      /*
      | Update password.
      */

      await tx
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(
          eq(users.id, user.id)
        );

      /*
      | Delete every existing session belonging
      | to this account.
      */

      await tx
        .delete(sessions)
        .where(
          eq(
            sessions.userId,
            user.id
          )
        );

      /*
      | Create the new session for this device.
      */

      await tx
        .insert(sessions)
        .values({
          userId: user.id,
          token: newSessionToken,
          expiresAt,
        });
    });

    /*
    |--------------------------------------------------------------------------
    | 12. Replace session cookie
    |--------------------------------------------------------------------------
    */

    cookieStore.set(
      "session",
      newSessionToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | 13. Success
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Password changed successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to change password.",
      },
      {
        status: 500,
      }
    );
  }
  }
