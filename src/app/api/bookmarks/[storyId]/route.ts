import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  storyBookmarks,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| Remove a specific story from the currently logged-in user's bookmarks.
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      storyId: string;
    }>;
  }
) {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Get current user
    |--------------------------------------------------------------------------
    */

    const user =
      await getCurrentUser();


    if (!user) {

      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 2. Get story ID from URL
    |--------------------------------------------------------------------------
    */

    const {
      storyId,
    } =
      await context.params;


    if (!storyId) {

      return NextResponse.json(
        {
          message:
            "Story ID is required.",
        },
        {
          status: 400,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 3. Delete the user's bookmark
    |--------------------------------------------------------------------------
    |
    | Both storyId and userId are checked.
    |
    | This means a user can ONLY delete their
    | own bookmark for that story.
    |
    |--------------------------------------------------------------------------
    */

    const deletedBookmark =
      await db
        .delete(
          storyBookmarks
        )
        .where(
          and(

            eq(
              storyBookmarks.storyId,
              storyId
            ),

            eq(
              storyBookmarks.userId,
              user.id
            )

          )
        )
        .returning({
          id:
            storyBookmarks.id,
        });


    /*
    |--------------------------------------------------------------------------
    | 4. Bookmark not found
    |--------------------------------------------------------------------------
    */

    if (
      deletedBookmark.length === 0
    ) {

      return NextResponse.json(
        {
          message:
            "Bookmark not found.",
        },
        {
          status: 404,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 5. Success
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Bookmark removed successfully.",
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "Delete bookmark error:",
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
