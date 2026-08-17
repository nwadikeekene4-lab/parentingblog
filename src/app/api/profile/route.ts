import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { createActivity } from "@/lib/activity";

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
    console.error("Fetch profile error:", error);

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

export async function PATCH(request: Request) {
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

    /*
    |--------------------------------------------------------------------------
    | Validate display name
    |--------------------------------------------------------------------------
    */

    if (
      typeof displayName !== "string" ||
      !displayName.trim()
    ) {
      return NextResponse.json(
        {
          message: "Display name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const newDisplayName = displayName.trim();

    if (newDisplayName.length > 100) {
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

    /*
    |--------------------------------------------------------------------------
    | Normalize values
    |--------------------------------------------------------------------------
    */

    const newBio =
      typeof bio === "string"
        ? bio.trim() || null
        : null;

    const newCountry =
      typeof country === "string"
        ? country.trim() || null
        : null;

    const newState =
      typeof state === "string"
        ? state.trim() || null
        : null;

    const newProfileImage =
      typeof profileImage === "string"
        ? profileImage.trim() || null
        : null;

    /*
    |--------------------------------------------------------------------------
    | Detect changes
    |--------------------------------------------------------------------------
    */

    const displayNameChanged =
      user.displayName !== newDisplayName;

    const bioChanged =
      (user.bio ?? null) !== newBio;

    const countryChanged =
      (user.country ?? null) !== newCountry;

    const stateChanged =
      (user.state ?? null) !== newState;

    const profileImageChanged =
      (user.profileImage ?? null) !==
      newProfileImage;

    /*
    |--------------------------------------------------------------------------
    | SAVE PROFILE FIRST
    |--------------------------------------------------------------------------
    */

    await db
      .update(users)
      .set({
        displayName: newDisplayName,
        bio: newBio,
        country: newCountry,
        state: newState,
        profileImage: newProfileImage,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    /*
    |--------------------------------------------------------------------------
    | Record activities separately.
    |
    | An activity failure must NOT make a successful
    | profile update appear to the user as a failure.
    |--------------------------------------------------------------------------
    */

    const activities: {
      type:
        | "profile_display_name_updated"
        | "profile_bio_updated"
        | "profile_country_updated"
        | "profile_state_updated"
        | "profile_image_updated";
      message: string;
    }[] = [];

    if (displayNameChanged) {
      activities.push({
        type: "profile_display_name_updated",
        message: "You updated your display name.",
      });
    }

    if (bioChanged) {
      activities.push({
        type: "profile_bio_updated",
        message: "You updated your bio.",
      });
    }

    if (countryChanged) {
      activities.push({
        type: "profile_country_updated",
        message: "You updated your country.",
      });
    }

    if (stateChanged) {
      activities.push({
        type: "profile_state_updated",
        message: "You updated your state.",
      });
    }

    if (profileImageChanged) {
      activities.push({
        type: "profile_image_updated",
        message: "You updated your profile picture.",
      });
    }

    for (const activity of activities) {
      try {
        await createActivity({
          userId: user.id,
          type: activity.type,
          message: activity.message,
        });
      } catch (activityError) {
        console.error(
          "Failed to record profile activity:",
          activityError
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch the actual saved profile
    |--------------------------------------------------------------------------
    */

    const updatedUser =
      await db.query.users.findFirst({
        where: (users, { eq }) =>
          eq(users.id, user.id),
      });

    if (!updatedUser) {
      return NextResponse.json(
        {
          message:
            "Profile was updated, but the saved profile could not be loaded.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Return saved profile
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message: "Profile updated successfully.",

        profile: {
          id: updatedUser.id,
          displayName: updatedUser.displayName,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
          country: updatedUser.country,
          state: updatedUser.state,
        },
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
        message: "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
          }
