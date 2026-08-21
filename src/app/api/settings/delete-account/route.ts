import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

import { comparePassword } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(request: Request) {
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
    | 2. Prevent administrator deletion
    |--------------------------------------------------------------------------
    |
    | Normal account deletion should never be used to remove an admin account.
    |--------------------------------------------------------------------------
    */

    if (user.role === "admin") {
      return NextResponse.json(
        {
          message:
            "Administrator accounts cannot be deleted from account settings.",
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Read request body
    |--------------------------------------------------------------------------
    */

    let body: {
      currentPassword?: unknown;
      confirmation?: unknown;
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

    const confirmation =
      typeof body.confirmation === "string"
        ? body.confirmation
        : "";

    /*
    |--------------------------------------------------------------------------
    | 4. Validate required fields
    |--------------------------------------------------------------------------
    */

    if (!currentPassword) {
      return NextResponse.json(
        {
          message:
            "Your current password is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        {
          message:
            'Please type "DELETE" to confirm account deletion.',
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Verify current password
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
    | 6. Delete account
    |--------------------------------------------------------------------------
    |
    | The database schema already contains the appropriate ON DELETE CASCADE
    | relationships for the user's sessions, stories, likes, bookmarks,
    | notifications, activities, reports and authentication tokens.
    |
    | Comments intentionally use ON DELETE SET NULL for userId, meaning
    | comments can remain on stories after the account is deleted.
    |--------------------------------------------------------------------------
    */

    await db
      .delete(users)
      .where(eq(users.id, user.id));

    /*
    |--------------------------------------------------------------------------
    | 7. Remove session cookie
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    cookieStore.set(
      "session",
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      }
    );

    /*
    |--------------------------------------------------------------------------
    | 8. Success
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Your account has been permanently deleted.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete your account. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
