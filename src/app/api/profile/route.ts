import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";


/*
|--------------------------------------------------------------------------
| GET PROFILE
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        profile: {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          profileImage: user.profileImage,
          bio: user.bio,
          country: user.country,
          state: user.state,
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "Fetch profile error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch profile.",
      },
      {
        status: 500,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| PATCH PROFILE
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      displayName,
      bio,
      country,
      state,
      profileImage,
    } = body;


    if (
      typeof displayName !== "string" ||
      !displayName.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Display name is required.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      displayName.trim().length > 100
    ) {
      return NextResponse.json(
        {
          message:
            "Display name cannot exceed 100 characters.",
        },
        {
          status: 400,
        }
      );
    }


    await db
      .update(users)
      .set({
        displayName:
          displayName.trim(),

        bio:
          typeof bio === "string"
            ? bio.trim() || null
            : null,

        country:
          typeof country === "string"
            ? country.trim() || null
            : null,

        state:
          typeof state === "string"
            ? state.trim() || null
            : null,

        profileImage:
          typeof profileImage === "string"
            ? profileImage.trim() || null
            : null,

        updatedAt:
          new Date(),
      })
      .where(
        eq(
          users.id,
          user.id
        )
      );


    const updatedUser =
      await db.query.users.findFirst({
        where: (users, { eq }) =>
          eq(
            users.id,
            user.id
          ),
      });


    return NextResponse.json(
      {
        message:
          "Profile updated successfully.",

        profile: updatedUser
          ? {
              id: updatedUser.id,
              displayName:
                updatedUser.displayName,
              email:
                updatedUser.email,
              profileImage:
                updatedUser.profileImage,
              bio:
                updatedUser.bio,
              country:
                updatedUser.country,
              state:
                updatedUser.state,
            }
          : null,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
          }
