import { NextResponse } from "next/server";
import {
  and,
  eq,
} from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  sessions,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

type UserRole =
  | "admin"
  | "user"
  | "moderator";

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
*/

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: "Forbidden.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/users/[id]
|--------------------------------------------------------------------------
|
| Allowed:
| {
|   role?: "admin" | "user" | "moderator",
|   isActive?: boolean
| }
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent self-modification of admin account
    |--------------------------------------------------------------------------
    */

    if (id === auth.user!.id) {
      return NextResponse.json(
        {
          message:
            "You cannot change your own admin account from this page.",
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Read body
    |--------------------------------------------------------------------------
    */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    const role =
      typeof data.role === "string"
        ? data.role
        : undefined;

    const isActive =
      typeof data.isActive ===
      "boolean"
        ? data.isActive
        : undefined;

    /*
    |--------------------------------------------------------------------------
    | Validate requested role
    |--------------------------------------------------------------------------
    */

    if (
      role !== undefined &&
      role !== "admin" &&
      role !== "user" &&
      role !== "moderator"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid user role.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      role === undefined &&
      isActive === undefined
    ) {
      return NextResponse.json(
        {
          message:
            "No changes were provided.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find target user
    |--------------------------------------------------------------------------
    */

    const targetUser =
      await db.query.users.findFirst({
        where: eq(
          users.id,
          id
        ),
        columns: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

    if (!targetUser) {
      return NextResponse.json(
        {
          message:
            "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Build update
    |--------------------------------------------------------------------------
    */

    const updateData: {
      role?: UserRole;
      isActive?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (role !== undefined) {
      updateData.role =
        role as UserRole;
    }

    if (isActive !== undefined) {
      updateData.isActive =
        isActive;
    }

    /*
    |--------------------------------------------------------------------------
    | Update user
    |--------------------------------------------------------------------------
    */

    const [updatedUser] =
      await db
        .update(users)
        .set(updateData)
        .where(
          eq(users.id, id)
        )
        .returning({
          id: users.id,
          displayName:
            users.displayName,
          email: users.email,
          role: users.role,
          isActive:
            users.isActive,
          emailVerified:
            users.emailVerified,
        });

    /*
    |--------------------------------------------------------------------------
    | If disabled, remove active sessions
    |--------------------------------------------------------------------------
    |
    | This immediately signs the user out everywhere.
    |
    */

    if (
      isActive === false
    ) {
      await db
        .delete(sessions)
        .where(
          eq(
            sessions.userId,
            id
          )
        );
    }

    let message =
      "User updated successfully.";

    if (
      isActive === false
    ) {
      message =
        "User has been deactivated and signed out.";
    } else if (
      isActive === true
    ) {
      message =
        "User has been activated.";
    } else if (
      role !== undefined
    ) {
      message =
        "User role updated successfully.";
    }

    return NextResponse.json(
      {
        message,
        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin user PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update user.",
      },
      {
        status: 500,
      }
    );
  }
  }
