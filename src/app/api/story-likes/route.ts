import { NextRequest, NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  notifications,
  stories,
  storyLikes,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";


// ============================================================
// GET
// Check whether the current user liked the story
// and return the total number of likes.
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const storyId =
      request.nextUrl.searchParams.get("storyId");

    if (!storyId) {
      return NextResponse.json(
        {
          message: "Story ID is required.",
        },
        { status: 400 }
      );
    }

    // Verify that the story exists and has not been deleted.
    const [story] = await db
      .select({
        id: stories.id,
      })
      .from(stories)
      .where(
        and(
          eq(stories.id, storyId),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    if (!story) {
      return NextResponse.json(
        {
          message: "Story not found.",
        },
        { status: 404 }
      );
    }

    // Get total number of likes.
    const [likeResult] = await db
      .select({
        count: count(),
      })
      .from(storyLikes)
      .where(
        eq(storyLikes.storyId, storyId)
      );

    const likeCount = Number(
      likeResult?.count ?? 0
    );

    // Authentication is optional for GET.
    // Logged-out visitors can still see the like count.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({
        liked: false,
        likeCount,
      });
    }

    // Check whether this user has liked the story.
    const [existingLike] = await db
      .select({
        id: storyLikes.id,
      })
      .from(storyLikes)
      .where(
        and(
          eq(storyLikes.storyId, storyId),
          eq(storyLikes.userId, user.id)
        )
      )
      .limit(1);

    return NextResponse.json({
      liked: Boolean(existingLike),
      likeCount,
    });
  } catch (error) {
    console.error(
      "GET /api/story-likes error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load story likes.",
      },
      { status: 500 }
    );
  }
}


// ============================================================
// POST
// Like a story.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to like a story.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const storyId = body?.storyId;

    if (
      !storyId ||
      typeof storyId !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Story ID is required.",
        },
        { status: 400 }
      );
    }

    // Verify that the story exists.
    const [story] = await db
      .select({
        id: stories.id,
        authorId: stories.authorId,
        slug: stories.slug,
        status: stories.status,
      })
      .from(stories)
      .where(
        and(
          eq(stories.id, storyId),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    if (!story) {
      return NextResponse.json(
        {
          message: "Story not found.",
        },
        { status: 404 }
      );
    }

    // Only published stories can be liked.
    if (story.status !== "published") {
      return NextResponse.json(
        {
          message:
            "This story cannot be liked.",
        },
        { status: 400 }
      );
    }

    // Check whether the user already liked this story.
    const [existingLike] = await db
      .select({
        id: storyLikes.id,
      })
      .from(storyLikes)
      .where(
        and(
          eq(storyLikes.storyId, storyId),
          eq(storyLikes.userId, user.id)
        )
      )
      .limit(1);

    // If already liked, don't create another record.
    if (existingLike) {
      const [likeResult] = await db
        .select({
          count: count(),
        })
        .from(storyLikes)
        .where(
          eq(
            storyLikes.storyId,
            storyId
          )
        );

      return NextResponse.json({
        liked: true,
        likeCount: Number(
          likeResult?.count ?? 0
        ),
      });
    }

    // Create the like.
    await db.insert(storyLikes).values({
      storyId,
      userId: user.id,
    });

    // Notify the story author.
    // The author should NOT receive a notification
    // when liking their own story.
    if (story.authorId !== user.id) {
      await db
        .insert(notifications)
        .values({
          userId: story.authorId,
          type: "like",
          message:
            "Someone liked your story.",
          link: `/stories/${story.slug}`,
          storyId: story.id,
        });
    }

    // Get updated like count.
    const [likeResult] = await db
      .select({
        count: count(),
      })
      .from(storyLikes)
      .where(
        eq(
          storyLikes.storyId,
          storyId
        )
      );

    return NextResponse.json({
      liked: true,
      likeCount: Number(
        likeResult?.count ?? 0
      ),
    });
  } catch (error) {
    console.error(
      "POST /api/story-likes error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to like story.",
      },
      { status: 500 }
    );
  }
}


// ============================================================
// DELETE
// Remove the current user's like.
// ============================================================

export async function DELETE(
  request: NextRequest
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to unlike a story.",
        },
        { status: 401 }
      );
    }

    const storyId =
      request.nextUrl.searchParams.get(
        "storyId"
      );

    if (!storyId) {
      return NextResponse.json(
        {
          message: "Story ID is required.",
        },
        { status: 400 }
      );
    }

    // Remove only this user's like.
    await db
      .delete(storyLikes)
      .where(
        and(
          eq(
            storyLikes.storyId,
            storyId
          ),
          eq(
            storyLikes.userId,
            user.id
          )
        )
      );

    // Get updated like count.
    const [likeResult] = await db
      .select({
        count: count(),
      })
      .from(storyLikes)
      .where(
        eq(
          storyLikes.storyId,
          storyId
        )
      );

    return NextResponse.json({
      liked: false,
      likeCount: Number(
        likeResult?.count ?? 0
      ),
    });
  } catch (error) {
    console.error(
      "DELETE /api/story-likes error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to unlike story.",
      },
      { status: 500 }
    );
  }
        }
