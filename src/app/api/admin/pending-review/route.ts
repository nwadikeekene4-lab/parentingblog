import { NextResponse } from "next/server";
import { and, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
  users,
  notifications,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Return stories waiting for administrator review.
|--------------------------------------------------------------------------
*/

export async function GET(request: Request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
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
    | Administrator authorization
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
    | Search
    |--------------------------------------------------------------------------
    */

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    /*
    |--------------------------------------------------------------------------
    | Conditions
    |--------------------------------------------------------------------------
    */

    const conditions = [
      eq(stories.status, "pending_review"),
      eq(stories.isDeleted, false),
    ];

    if (search) {
      conditions.push(
        ilike(stories.title, `%${search}%`)
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Load pending stories
    |--------------------------------------------------------------------------
    */

    const pendingStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        excerpt: stories.excerpt,
        coverImage: stories.coverImage,

        category: categories.name,
        categoryId: categories.id,

        authorId: users.id,
        authorName: users.displayName,
        authorEmail: users.email,

        submissionType: stories.submissionType,
        status: stories.status,

        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .leftJoin(
        categories,
        eq(stories.categoryId, categories.id)
      )
      .leftJoin(
        users,
        eq(stories.authorId, users.id)
      )
      .where(and(...conditions))
      .orderBy(desc(stories.updatedAt));

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        stories: pendingStories.map((story) => ({
          id: story.id,
          title: story.title,
          slug: story.slug,
          excerpt: story.excerpt,
          coverImage: story.coverImage,

          category: story.category ?? "Uncategorized",
          categoryId: story.categoryId,

          author: {
            id: story.authorId,
            name: story.authorName ?? "Unknown author",
            email: story.authorEmail ?? "",
          },

          submissionType: story.submissionType,
          status: story.status,

          submittedAt: story.createdAt,
          updatedAt: story.updatedAt,
        })),

        count: pendingStories.length,

        search,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin pending review GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load pending stories.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Approve or reject a pending story.
|
| body:
|
| {
|   action: "approve" | "reject",
|   storyId: string,
|   feedback?: string
| }
|--------------------------------------------------------------------------
*/

export async function POST(request: Request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
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
    | Administrator authorization
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
    | Parse body
    |--------------------------------------------------------------------------
    */

    let body: unknown;

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

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          message: "Invalid request.",
        },
        {
          status: 400,
        }
      );
    }

    const data = body as Record<string, unknown>;

    /*
    |--------------------------------------------------------------------------
    | Validate action
    |--------------------------------------------------------------------------
    */

    const action =
      data.action === "approve" ||
      data.action === "reject"
        ? data.action
        : null;

    if (!action) {
      return NextResponse.json(
        {
          message:
            "Invalid review action.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate story ID
    |--------------------------------------------------------------------------
    */

    const storyId =
      typeof data.storyId === "string"
        ? data.storyId.trim()
        : "";

    if (!storyId) {
      return NextResponse.json(
        {
          message: "Story ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Rejection feedback
    |--------------------------------------------------------------------------
    */

    const feedback =
      typeof data.feedback === "string"
        ? data.feedback.trim()
        : "";

    if (action === "reject") {
      if (!feedback) {
        return NextResponse.json(
          {
            message:
              "Please provide a reason for rejecting this story.",
          },
          {
            status: 400,
          }
        );
      }

      if (feedback.length < 5) {
        return NextResponse.json(
          {
            message:
              "Rejection feedback must be at least 5 characters.",
          },
          {
            status: 400,
          }
        );
      }

      if (feedback.length > 1000) {
        return NextResponse.json(
          {
            message:
              "Rejection feedback cannot exceed 1,000 characters.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | APPROVE
    |--------------------------------------------------------------------------
    */

    if (action === "approve") {
      const publishedAt = new Date();

      /*
      |--------------------------------------------------------------------------
      | Atomic pending → published transition
      |--------------------------------------------------------------------------
      |
      | The status condition prevents two administrators/actions from
      | approving the same story twice.
      |--------------------------------------------------------------------------
      */

      const updatedStories = await db
        .update(stories)
        .set({
          status: "published",
          publishedAt,
          updatedAt: publishedAt,
        })
        .where(
          and(
            eq(stories.id, storyId),
            eq(stories.status, "pending_review"),
            eq(stories.isDeleted, false)
          )
        )
        .returning({
          id: stories.id,
          title: stories.title,
          slug: stories.slug,
          authorId: stories.authorId,
        });

      const approvedStory = updatedStories[0];

      if (!approvedStory) {
        return NextResponse.json(
          {
            message:
              "This story is no longer waiting for review. It may already have been processed.",
          },
          {
            status: 409,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Notify author
      |--------------------------------------------------------------------------
      */

      try {
        await db.insert(notifications).values({
          userId: approvedStory.authorId,
          type: "system",
          message: `Your story "${approvedStory.title}" has been approved and published.`,
          link: `/stories/${approvedStory.slug}`,
          storyId: approvedStory.id,
          commentId: null,
          isRead: false,
        });
      } catch (notificationError) {
        /*
        |--------------------------------------------------------------------------
        | Notification failure must not undo approval.
        |--------------------------------------------------------------------------
        */

        console.error(
          "Story approval notification failed:",
          notificationError
        );
      }

      return NextResponse.json(
        {
          success: true,
          action: "approve",
          message:
            "Story approved and published successfully.",
          story: {
            id: approvedStory.id,
            title: approvedStory.title,
            slug: approvedStory.slug,
          },
        },
        {
          status: 200,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Atomic pending → draft transition
    |--------------------------------------------------------------------------
    |
    | This is safe with the current architecture because the
    | story_update status is only used for stories that are already
    | pending review.
    |--------------------------------------------------------------------------
    */

    const updatedStories = await db
      .update(stories)
      .set({
        status: "draft",
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stories.id, storyId),
          eq(stories.status, "pending_review"),
          eq(stories.isDeleted, false)
        )
      )
      .returning({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        authorId: stories.authorId,
      });

    const rejectedStory = updatedStories[0];

    if (!rejectedStory) {
      return NextResponse.json(
        {
          message:
            "This story is no longer waiting for review. It may already have been processed.",
        },
        {
          status: 409,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Notify author
    |--------------------------------------------------------------------------
    */

    try {
      await db.insert(notifications).values({
        userId: rejectedStory.authorId,
        type: "system",
        message: `Your story "${rejectedStory.title}" needs changes before it can be published. Admin feedback: ${feedback}`,
        link: `/users-dashboard/write-story?edit=${encodeURIComponent(
          rejectedStory.id
        )}`,
        storyId: rejectedStory.id,
        commentId: null,
        isRead: false,
      });
    } catch (notificationError) {
      /*
      |--------------------------------------------------------------------------
      | Notification failure must not undo rejection.
      |--------------------------------------------------------------------------
      */

      console.error(
        "Story rejection notification failed:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        success: true,
        action: "reject",
        message:
          "Story rejected and returned to the author as a draft.",
        story: {
          id: rejectedStory.id,
          title: rejectedStory.title,
          slug: rejectedStory.slug,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin pending review action error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to process the review action. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
          }
