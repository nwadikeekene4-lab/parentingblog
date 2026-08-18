import { and, count, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import {
  comments,
  commentLikes,
  notifications,
  stories,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Returns like counts and the current user's like state.
|
| Supports:
|
| ?commentId=COMMENT_ID
|
| or:
|
| ?commentIds=ID_1,ID_2,ID_3
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const singleCommentId =
      searchParams.get("commentId");

    const multipleCommentIds =
      searchParams.get("commentIds");

    let commentIds: string[] = [];

    if (singleCommentId) {
      commentIds = [singleCommentId];
    } else if (multipleCommentIds) {
      commentIds = multipleCommentIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }

    if (commentIds.length === 0) {
      return NextResponse.json(
        {
          message:
            "A comment ID is required.",
        },
        { status: 400 }
      );
    }

    if (commentIds.length > 100) {
      return NextResponse.json(
        {
          message:
            "Too many comments requested.",
        },
        { status: 400 }
      );
    }

    const existingComments =
      await db
        .select({
          id: comments.id,
        })
        .from(comments)
        .where(
          and(
            inArray(
              comments.id,
              commentIds
            ),
            eq(
              comments.isDeleted,
              false
            )
          )
        );

    const validIds =
      existingComments.map(
        (comment) => comment.id
      );

    if (validIds.length === 0) {
      return NextResponse.json({
        comments: {},
      });
    }

    /*
     * Get total like counts in one query.
     */

    const likeCounts =
      await db
        .select({
          commentId:
            commentLikes.commentId,
          count: count(
            commentLikes.id
          ),
        })
        .from(commentLikes)
        .where(
          inArray(
            commentLikes.commentId,
            validIds
          )
        )
        .groupBy(
          commentLikes.commentId
        );

    /*
     * Get current user.
     *
     * Authentication is optional for GET.
     * Logged-out visitors can still see
     * like counts.
     */

    const currentUser =
      await getCurrentUser();

    const userLikes =
      currentUser
        ? await db
            .select({
              commentId:
                commentLikes.commentId,
            })
            .from(commentLikes)
            .where(
              and(
                inArray(
                  commentLikes.commentId,
                  validIds
                ),
                eq(
                  commentLikes.userId,
                  currentUser.id
                )
              )
            )
        : [];

    const likedSet =
      new Set(
        userLikes.map(
          (like) => like.commentId
        )
      );

    const countMap =
      new Map(
        likeCounts.map((item) => [
          item.commentId,
          Number(item.count),
        ])
      );

    const result: Record<
      string,
      {
        liked: boolean;
        likeCount: number;
      }
    > = {};

    for (const commentId of validIds) {
      result[commentId] = {
        liked:
          likedSet.has(commentId),
        likeCount:
          countMap.get(commentId) ?? 0,
      };
    }

    return NextResponse.json({
      comments: result,
    });
  } catch (error) {
    console.error(
      "Comment likes GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load comment likes.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Likes a comment.
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to like a comment.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const commentId =
      typeof body?.commentId === "string"
        ? body.commentId.trim()
        : "";

    if (!commentId) {
      return NextResponse.json(
        {
          message:
            "Comment ID is required.",
        },
        { status: 400 }
      );
    }

    const comment =
      await db.query.comments.findFirst({
        where: and(
          eq(
            comments.id,
            commentId
          ),
          eq(
            comments.isDeleted,
            false
          )
        ),
        with: {
          user: true,
          story: true,
        },
      });

    if (!comment) {
      return NextResponse.json(
        {
          message:
            "Comment not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Prevent duplicate likes.
     *
     * The database unique constraint is
     * the final protection.
     */

    const existingLike =
      await db.query.commentLikes.findFirst({
        where: and(
          eq(
            commentLikes.commentId,
            commentId
          ),
          eq(
            commentLikes.userId,
            currentUser.id
          )
        ),
      });

    if (existingLike) {
      const result =
        await db
          .select({
            count: count(
              commentLikes.id
            ),
          })
          .from(commentLikes)
          .where(
            eq(
              commentLikes.commentId,
              commentId
            )
          );

      return NextResponse.json({
        liked: true,
        likeCount:
          Number(result[0]?.count) || 0,
      });
    }

    await db.insert(commentLikes).values({
      commentId,
      userId: currentUser.id,
    });

    /*
     * Do not notify a user about their own like.
     */

    if (
      comment.userId !==
      currentUser.id
    ) {
      await db.insert(notifications).values({
        userId: comment.userId,
        type: "like",
        message: `${currentUser.displayName} liked your comment.`,
        link: `/stories/${comment.story.slug}`,
        storyId: comment.storyId,
        commentId: comment.id,
      });
    }

    const result =
      await db
        .select({
          count: count(
            commentLikes.id
          ),
        })
        .from(commentLikes)
        .where(
          eq(
            commentLikes.commentId,
            commentId
          )
        );

    return NextResponse.json({
      liked: true,
      likeCount:
        Number(result[0]?.count) || 0,
    });
  } catch (error) {
    console.error(
      "Comment like POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to like comment.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| Removes the current user's like.
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to unlike a comment.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const commentId =
      typeof body?.commentId === "string"
        ? body.commentId.trim()
        : "";

    if (!commentId) {
      return NextResponse.json(
        {
          message:
            "Comment ID is required.",
        },
        { status: 400 }
      );
    }

    await db
      .delete(commentLikes)
      .where(
        and(
          eq(
            commentLikes.commentId,
            commentId
          ),
          eq(
            commentLikes.userId,
            currentUser.id
          )
        )
      );

    const result =
      await db
        .select({
          count: count(
            commentLikes.id
          ),
        })
        .from(commentLikes)
        .where(
          eq(
            commentLikes.commentId,
            commentId
          )
        );

    return NextResponse.json({
      liked: false,
      likeCount:
        Number(result[0]?.count) || 0,
    });
  } catch (error) {
    console.error(
      "Comment like DELETE error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to unlike comment.",
      },
      { status: 500 }
    );
  }
}
