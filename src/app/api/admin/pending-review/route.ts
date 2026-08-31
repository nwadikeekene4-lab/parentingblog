import { NextResponse } from "next/server";
import { and, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  users,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";


/*
|--------------------------------------------------------------------------
| GET /api/admin/pending-review
|--------------------------------------------------------------------------
|
| Admin-only endpoint.
|
| Fetches stories currently waiting for admin review.
|
| Includes:
| - New submissions
| - Story updates
| - Author
| - Category
| - Cover image
| - Submission/update date
|
| Supports:
| - Search by story title
|
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request
) {
  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Authenticate user
    |--------------------------------------------------------------------------
    */

    const user =
      await getCurrentUser();

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
    | 2. Admin authorization
    |--------------------------------------------------------------------------
    */

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 3. Read search parameter
    |--------------------------------------------------------------------------
    */

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";


    /*
    |--------------------------------------------------------------------------
    | 4. Build conditions
    |--------------------------------------------------------------------------
    |
    | Only stories awaiting review are returned.
    |
    | This automatically includes:
    |
    | new_submission
    | story_update
    |
    |--------------------------------------------------------------------------
    */

    const conditions = [
      eq(
        stories.status,
        "pending_review"
      ),

      eq(
        stories.isDeleted,
        false
      ),
    ];


    /*
    |--------------------------------------------------------------------------
    | 5. Optional title search
    |--------------------------------------------------------------------------
    */

    if (search) {
      conditions.push(
        ilike(
          stories.title,
          `%${search}%`
        )
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 6. Fetch pending stories
    |--------------------------------------------------------------------------
    |
    | We intentionally do NOT fetch the full story content here.
    |
    | The list page only needs enough information to display
    | the pending-review cards.
    |--------------------------------------------------------------------------
    */

    const pendingStories =
      await db
        .select({

          id:
            stories.id,

          title:
            stories.title,

          slug:
            stories.slug,

          excerpt:
            stories.excerpt,

          coverImage:
            stories.coverImage,

          category:
            categories.name,

          categoryId:
            stories.categoryId,

          authorId:
            stories.authorId,

          authorName:
            users.displayName,

          authorEmail:
            users.email,

          submissionType:
            stories.submissionType,

          status:
            stories.status,

          createdAt:
            stories.createdAt,

          updatedAt:
            stories.updatedAt,

        })

        .from(stories)

        .innerJoin(
          categories,
          eq(
            stories.categoryId,
            categories.id
          )
        )

        .innerJoin(
          users,
          eq(
            stories.authorId,
            users.id
          )
        )

        .where(
          and(
            ...conditions
          )
        )

        /*
        |--------------------------------------------------------------------------
        | Most recently submitted/updated stories first.
        |--------------------------------------------------------------------------
        */

        .orderBy(
          desc(
            stories.updatedAt
          )
        );


    /*
    |--------------------------------------------------------------------------
    | 7. Format response
    |--------------------------------------------------------------------------
    */

    const formattedStories =
      pendingStories.map(
        (story) => ({

          id:
            story.id,

          title:
            story.title,

          slug:
            story.slug,

          excerpt:
            story.excerpt,

          coverImage:
            story.coverImage,

          category:
            story.category,

          categoryId:
            story.categoryId,

          author: {
            id:
              story.authorId,

            name:
              story.authorName,

            email:
              story.authorEmail,
          },

          /*
          |--------------------------------------------------------------------------
          | UI can use this to display:
          |
          | "New Submission"
          |
          | or
          |
          | "Story Update"
          |--------------------------------------------------------------------------
          */

          submissionType:
            story.submissionType,

          status:
            story.status,

          /*
          |--------------------------------------------------------------------------
          | Both dates are returned so the UI can show the
          | appropriate date depending on the submission type.
          |--------------------------------------------------------------------------
          */

          submittedAt:
            story.createdAt,

          updatedAt:
            story.updatedAt,

        })
      );


    /*
    |--------------------------------------------------------------------------
    | 8. Return response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        stories:
          formattedStories,

        count:
          formattedStories.length,

        search,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Admin pending review error:",
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
