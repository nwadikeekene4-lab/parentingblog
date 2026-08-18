import {
  and,
  count,
  eq,
  inArray,
} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import {
  comments,
  commentLikes,
  notifications,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const GUEST_COOKIE_NAME =
  "parenting_blog_guest_id";

const GUEST_COOKIE_MAX_AGE =
  60 * 60 * 24 * 365;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function isValidUUID(
  value: string
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getGuestId(
  request: NextRequest
) {
  const guestId =
    request.cookies.get(
      GUEST_COOKIE_NAME
    )?.value;

  if (
    guestId &&
    isValidUUID(guestId)
  ) {
    return guestId;
  }

  return null;
}

function createGuestResponse(
  data: unknown,
  guestId: string | null,
  status = 200
) {
  const response =
    NextResponse.json(
      data,
      { status }
    );

  if (guestId) {
    response.cookies.set(
      GUEST_COOKIE_NAME,
      guestId,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          GUEST_COOKIE_MAX_AGE,
      }
    );
  }

  return response;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Returns like counts and the current
| visitor's like state.
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

    let commentIds: string[] =
      [];

    if (singleCommentId) {
      commentIds = [
        singleCommentId,
      ];
    } else if (
      multipleCommentIds
    ) {
      commentIds =
        multipleCommentIds
          .split(",")
          .map((id) =>
            id.trim()
          )
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
     * Get total like counts.
     *
     * This includes BOTH:
     * - registered users
     * - anonymous visitors
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
     * Authentication is optional.
     *
     * Registered users use userId.
     *
     * Anonymous visitors use guestId.
     */

    const currentUser =
      await getCurrentUser();

    let guestId: string | null =
      null;

    if (!currentUser) {
      guestId =
        getGuestId(request) ??
        crypto.randomUUID();
    }

    /*
     * Find likes belonging to the
     * current visitor.
     */

    const identityLikes =
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
        : await db
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
                  commentLikes.guestId,
                  guestId!
                )
              )
            );

    const likedSet =
      new Set(
        identityLikes.map(
          (like) =>
            like.commentId
        )
      );

    const countMap =
      new Map(
        likeCounts.map(
          (item) => [
            item.commentId,
            Number(item.count),
          ]
        )
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
          likedSet.has(
            commentId
          ),

        likeCount:
          countMap.get(
            commentId
          ) ?? 0,
      };
    }

    return createGuestResponse(
      {
        comments: result,
      },
      currentUser
        ? null
        : guestId
    );
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
|
| Registered user:
|   userId is stored.
|
| Anonymous visitor:
|   guestId is stored.
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const currentUser =
      await getCurrentUser();

    /*
     * Anonymous visitors receive a
     * persistent guest identity.
     */

    const guestId =
      currentUser
        ? null
        : getGuestId(request) ??
          crypto.randomUUID();

    const body =
      await request.json();

    const commentId =
      typeof body?.commentId ===
      "string"
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

    /*
     * Verify the comment exists.
     */

    const comment =
      await db.query.comments.findFirst(
        {
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
        }
      );

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
     * Check for an existing like.
     */

    const existingLike =
      currentUser
        ? await db.query.commentLikes.findFirst(
            {
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
            }
          )
        : await db.query.commentLikes.findFirst(
            {
              where: and(
                eq(
                  commentLikes.commentId,
                  commentId
                ),
                eq(
                  commentLikes.guestId,
                  guestId!
                )
              ),
            }
          );

    /*
     * Already liked.
     */

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

      return createGuestResponse(
        {
          liked: true,

          likeCount:
            Number(
              result[0]?.count
            ) || 0,
        },
        currentUser
          ? null
          : guestId
      );
    }

    /*
     * Create the like.
     *
     * Exactly one identity is stored.
     */

    await db
      .insert(commentLikes)
      .values({
        commentId,

        userId:
          currentUser?.id ??
          null,

        guestId:
          currentUser
            ? null
            : guestId,
      });

    /*
     * Only registered users can
     * generate notifications.
     *
     * Anonymous visitors can like
     * comments but cannot receive
     * or generate account notifications.
     */

    if (
      currentUser &&
      comment.userId &&
      comment.userId !==
        currentUser.id
    ) {
      await db
        .insert(notifications)
        .values({
          userId:
            comment.userId,

          type: "like",

          message:
            `${currentUser.displayName} liked your comment.`,

          link:
            `/stories/${comment.story.slug}`,

          storyId:
            comment.storyId,

          commentId:
            comment.id,
        });
    }

    /*
     * Get updated like count.
     */

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

    return createGuestResponse(
      {
        liked: true,

        likeCount:
          Number(
            result[0]?.count
          ) || 0,
      },
      currentUser
        ? null
        : guestId
    );
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
| Removes the current visitor's like.
|
| Registered user:
|   userId
|
| Anonymous visitor:
|   guestId
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest
) {
  try {
    const currentUser =
      await getCurrentUser();

    /*
     * Anonymous visitors must use
     * their existing guest cookie.
     */

    const guestId =
      currentUser
        ? null
        : getGuestId(request);

    const body =
      await request.json();

    const commentId =
      typeof body?.commentId ===
      "string"
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

    /*
     * Remove only this visitor's like.
     */

    if (currentUser) {
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
    } else if (guestId) {
      await db
        .delete(commentLikes)
        .where(
          and(
            eq(
              commentLikes.commentId,
              commentId
            ),
            eq(
              commentLikes.guestId,
              guestId
            )
          )
        );
    }

    /*
     * Get updated count.
     */

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
        Number(
          result[0]?.count
        ) || 0,
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
