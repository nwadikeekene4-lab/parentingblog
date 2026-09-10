import { NextResponse } from "next/server";
import { and, count, eq, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  storyRevisions,
  users,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Overview statistics
    |--------------------------------------------------------------------------
    |
    | All statistics are calculated directly from the database.
    |
    */

    const [
      pendingStoriesResult,
      pendingRevisionsResult,
      publishedResult,
      myStoriesResult,
      featuredResult,
      usersResult,
      viewsResult,
    ] = await Promise.all([
      /*
      |--------------------------------------------------------------------------
      | Pending new story submissions
      |--------------------------------------------------------------------------
      */

      db
        .select({
          count: count(),
        })
        .from(stories)
        .where(
          and(
            eq(
              stories.status,
              "pending_review"
            ),
            eq(
              stories.isDeleted,
              false
            )
          )
        ),

      /*
      |--------------------------------------------------------------------------
      | Pending published-story revisions
      |--------------------------------------------------------------------------
      */

      db
        .select({
          count: count(),
        })
        .from(storyRevisions)
        .where(
          eq(
            storyRevisions.status,
            "pending_review"
          )
        ),

      /*
      |--------------------------------------------------------------------------
      | Published stories
      |--------------------------------------------------------------------------
      */

      db
        .select({
          count: count(),
        })
        .from(stories)
        .where(
          and(
            eq(
              stories.status,
              "published"
            ),
            eq(
              stories.isDeleted,
              false
            )
          )
        ),

      /*
      |--------------------------------------------------------------------------
      | Stories belonging to the current admin
      |--------------------------------------------------------------------------
      */

      db
        .select({
          count: count(),
        })
        .from(stories)
        .where(
          and(
            eq(
              stories.authorId,
              user.id
            ),
            eq(
              stories.isDeleted,
              false
            )
          )
        ),

      /*
      |--------------------------------------------------------------------------
      | Featured stories
      |--------------------------------------------------------------------------
      */

      db
        .select({
          count: count(),
        })
        .from(stories)
        .where(
          and(
            eq(
              stories.featured,
              true
            ),
            eq(
              stories.status,
              "published"
            ),
            eq(
              stories.isDeleted,
              false
            )
          )
        ),

      /*
      |--------------------------------------------------------------------------
      | Registered users
      |--------------------------------------------------------------------------
      */

      db
        .select({
          count: count(),
        })
        .from(users),

      /*
      |--------------------------------------------------------------------------
      | Total story views
      |--------------------------------------------------------------------------
      |
      | The current project stores story views directly on stories.views.
      | This represents total story views, not unique visitors.
      |
      */

      db
        .select({
          totalViews: sum(
            stories.views
          ),
        })
        .from(stories)
        .where(
          and(
            eq(
              stories.status,
              "published"
            ),
            eq(
              stories.isDeleted,
              false
            )
          )
        ),
    ]);

    const pendingReview =
      Number(
        pendingStoriesResult[0]?.count ?? 0
      ) +
      Number(
        pendingRevisionsResult[0]?.count ?? 0
      );

    const published =
      Number(
        publishedResult[0]?.count ?? 0
      );

    const myStories =
      Number(
        myStoriesResult[0]?.count ?? 0
      );

    const featured =
      Number(
        featuredResult[0]?.count ?? 0
      );

    const registeredUsers =
      Number(
        usersResult[0]?.count ?? 0
      );

    const visitors =
      Number(
        viewsResult[0]?.totalViews ?? 0
      );

    return NextResponse.json(
      {
        pendingReview,
        published,
        myStories,
        featured,
        users: registeredUsers,
        visitors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin overview GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load admin overview statistics.",
      },
      { status: 500 }
    );
  }
  }
