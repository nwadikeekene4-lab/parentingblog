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
|
| Supports partial updates.
|
| Example:
|
| { profileImage: "..." }
|
| updates ONLY the profile image.
|
| Personal information can still be updated by
| sending displayName, bio, country and state.
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

    /*
    |--------------------------------------------------------------------------
    | Determine which fields were actually supplied.
    |--------------------------------------------------------------------------
    */

    const hasDisplayName =
      Object.prototype.hasOwnProperty.call(
        body,
        "displayName"
      );

    const hasBio =
      Object.prototype.hasOwnProperty.call(
        body,
        "bio"
      );

    const hasCountry =
      Object.prototype.hasOwnProperty.call(
        body,
        "country"
      );

    const hasState =
      Object.prototype.hasOwnProperty.call(
        body,
        "state"
      );

    const hasProfileImage =
      Object.prototype.hasOwnProperty.call(
        body,
        "profileImage"
      );

    /*
    |--------------------------------------------------------------------------
    | Nothing to update.
    |--------------------------------------------------------------------------
    */

    if (
      !hasDisplayName &&
      !hasBio &&
      !hasCountry &&
      !hasState &&
      !hasProfileImage
    ) {
      return NextResponse.json(
        {
          message: "No profile changes were provided.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare updated values.
    |
    | If a field was NOT supplied, keep the existing
    | database value unchanged.
    |--------------------------------------------------------------------------
    */

    let newDisplayName =
      user.displayName;

    let newBio =
      user.bio ?? null;

    let newCountry =
      user.country ?? null;

    let newState =
      user.state ?? null;

    let newProfileImage =
      user.profileImage ?? null;

    /*
    |--------------------------------------------------------------------------
    | DISPLAY NAME
    |--------------------------------------------------------------------------
    */

    if (hasDisplayName) {
      if (
        typeof body.displayName !==
          "string" ||
        !body.displayName.trim()
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

      newDisplayName =
        body.displayName.trim();

      if (
        newDisplayName.length > 100
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
    }

    /*
    |--------------------------------------------------------------------------
    | BIO
    |--------------------------------------------------------------------------
    */

    if (hasBio) {
      newBio =
        typeof body.bio === "string"
          ? body.bio.trim() || null
          : null;
    }

    /*
    |--------------------------------------------------------------------------
    | COUNTRY
    |--------------------------------------------------------------------------
    */

    if (hasCountry) {
      newCountry =
        typeof body.country ===
        "string"
          ? body.country.trim() || null
          : null;
    }

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    if (hasState) {
      newState =
        typeof body.state ===
        "string"
          ? body.state.trim() || null
          : null;
    }

    /*
    |--------------------------------------------------------------------------
    | PROFILE IMAGE
    |--------------------------------------------------------------------------
    */

    if (hasProfileImage) {
      newProfileImage =
        typeof body.profileImage ===
        "string"
          ? body.profileImage.trim() || null
          : null;
    }

    /*
    |--------------------------------------------------------------------------
    | Detect changes
    |--------------------------------------------------------------------------
    */

    const displayNameChanged =
      user.displayName !==
      newDisplayName;

    const bioChanged =
      (user.bio ?? null) !== newBio;

    const countryChanged =
      (user.country ?? null) !==
      newCountry;

    const stateChanged =
      (user.state ?? null) !==
      newState;

    const profileImageChanged =
      (user.profileImage ?? null) !==
      newProfileImage;

    /*
    |--------------------------------------------------------------------------
    | SAVE ONLY THE SUPPLIED FIELDS
    |--------------------------------------------------------------------------
    */

    const updateData: {
      displayName?: string;
      bio?: string | null;
      country?: string | null;
      state?: string | null;
      profileImage?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (hasDisplayName) {
      updateData.displayName =
        newDisplayName;
    }

    if (hasBio) {
      updateData.bio = newBio;
    }

    if (hasCountry) {
      updateData.country =
        newCountry;
    }

    if (hasState) {
      updateData.state =
        newState;
    }

    if (hasProfileImage) {
      updateData.profileImage =
        newProfileImage;
    }

    await db
      .update(users)
      .set(updateData)
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

    if (
      hasDisplayName &&
      displayNameChanged
    ) {
      activities.push({
        type:
          "profile_display_name_updated",
        message:
          "You updated your display name.",
      });
    }

    if (
      hasBio &&
      bioChanged
    ) {
      activities.push({
        type:
          "profile_bio_updated",
        message:
          "You updated your bio.",
      });
    }

    if (
      hasCountry &&
      countryChanged
    ) {
      activities.push({
        type:
          "profile_country_updated",
        message:
          "You updated your country.",
      });
    }

    if (
      hasState &&
      stateChanged
    ) {
      activities.push({
        type:
          "profile_state_updated",
        message:
          "You updated your state.",
      });
    }

    if (
      hasProfileImage &&
      profileImageChanged
    ) {
      activities.push({
        type:
          "profile_image_updated",
        message:
          "You updated your profile picture.",
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
        message:
          "Profile updated successfully.",

        profile: {
          id: updatedUser.id,
          displayName:
            updatedUser.displayName,
          email: updatedUser.email,
          profileImage:
            updatedUser.profileImage,
          bio: updatedUser.bio,
          country:
            updatedUser.country,
          state:
            updatedUser.state,
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
        message:
          "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
            }
