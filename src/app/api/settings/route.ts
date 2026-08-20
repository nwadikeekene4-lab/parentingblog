import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

/*
|--------------------------------------------------------------------------
| GET SETTINGS
|--------------------------------------------------------------------------
| Fetch the currently logged-in user's settings.
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
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

    const [settings] = await db
      .select({
        emailNotifications:
          users.emailNotifications,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!settings) {
      return NextResponse.json(
        {
          message: "User settings not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        settings: {
          emailNotifications:
            settings.emailNotifications,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Fetch settings error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch settings.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH SETTINGS
|--------------------------------------------------------------------------
| Update the currently logged-in user's settings.
|--------------------------------------------------------------------------
*/

export async function PATCH(request: Request) {
  try {
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

    const body = await request.json();

    if (
      typeof body.emailNotifications !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          message:
            "Email notification setting must be true or false.",
        },
        {
          status: 400,
        }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        emailNotifications:
          body.emailNotifications,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        emailNotifications:
          users.emailNotifications,
      });

    if (!updatedUser) {
      return NextResponse.json(
        {
          message:
            "Settings could not be updated.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Settings updated successfully.",

        settings: {
          emailNotifications:
            updatedUser.emailNotifications,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to update settings.",
      },
      {
        status: 500,
      }
    );
  }
  }
