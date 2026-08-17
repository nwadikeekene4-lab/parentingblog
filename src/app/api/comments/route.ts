import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  comments,
  stories,
  users,
  notifications,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const MAX_COMMENT_LENGTH = 2000;

type CommentTreeItem = {
  id: string;
  content: string;
  parentCommentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    displayName: string;
    profileImage: string | null;
  };
  replies: CommentTreeItem[];
};

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/*
|--------------------------------------------------------------------------
| GET — FETCH COMMENTS
|--------------------------------------------------------------------------
*/

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const storyId = cleanText(
      searchParams.get("storyId")
    );

    if (!storyId) {
      return NextResponse.json(
        {
          message:
            "Story ID is required.",
        },
        { status: 400 }
      );
    }

    const story =
      await db.query.stories.findFirst({
        where: and(
          eq(stories.id, storyId),
          eq(
            stories.status,
            "published"
          ),
          eq(
            stories.isDeleted,
            false
          )
        ),
        columns: {
          id: true,
        },
      });

    if (!story) {
      return NextResponse.json(
        {
          message:
            "Story not found.",
        },
        { status: 404 }
      );
    }

    const result = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentCommentId:
          comments.parentCommentId,
        createdAt:
          comments.createdAt,
        updatedAt:
          comments.updatedAt,
        userId: users.id,
        displayName:
          users.displayName,
        profileImage:
          users.profileImage,
      })
      .from(comments)
      .innerJoin(
        users,
        eq(
          comments.userId,
          users.id
        )
      )
      .where(
        and(
          eq(
            comments.storyId,
            storyId
          ),
          eq(
            comments.isDeleted,
            false
          ),
          eq(
            comments.isApproved,
            true
          )
        )
      )
      .orderBy(
        desc(
          comments.createdAt
        )
      );

    const commentsMap =
      new Map<
        string,
        CommentTreeItem
      >();

    const roots: CommentTreeItem[] =
      [];

    for (const comment of result) {
      const item: CommentTreeItem = {
        id: comment.id,
        content: comment.content,
        parentCommentId:
          comment.parentCommentId,
        createdAt:
          comment.createdAt,
        updatedAt:
          comment.updatedAt,
        user: {
          id: comment.userId,
          displayName:
            comment.displayName,
          profileImage:
            comment.profileImage,
        },
        replies: [],
      };

      commentsMap.set(
        comment.id,
        item
      );

      if (!comment.parentCommentId) {
        roots.push(item);
      }
    }

    for (const comment of result) {
      if (!comment.parentCommentId) {
        continue;
      }

      const parent =
        commentsMap.get(
          comment.parentCommentId
        );

      const child =
        commentsMap.get(
          comment.id
        );

      if (parent && child) {
        parent.replies.push(
          child
        );
      }
    }

    return NextResponse.json(
      {
        comments: roots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Fetch comments error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch comments.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST — CREATE COMMENT / REPLY
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to comment.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const storyId = cleanText(
      body.storyId
    );

    const content = cleanText(
      body.content
    );

    const parentCommentId =
      cleanText(
        body.parentCommentId
      ) || null;

    if (!storyId || !content) {
      return NextResponse.json(
        {
          message:
            "Story ID and comment are required.",
        },
        { status: 400 }
      );
    }

    if (
      content.length >
      MAX_COMMENT_LENGTH
    ) {
      return NextResponse.json(
        {
          message:
            `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    const story =
      await db.query.stories.findFirst({
        where: and(
          eq(stories.id, storyId),
          eq(
            stories.status,
            "published"
          ),
          eq(
            stories.isDeleted,
            false
          )
        ),
        columns: {
          id: true,
          slug: true,
          title: true,
          authorId: true,
        },
      });

    if (!story) {
      return NextResponse.json(
        {
          message:
            "Story not found.",
        },
        { status: 404 }
      );
    }

    let parentComment:
      | {
          id: string;
          userId: string;
        }
      | null = null;

    if (parentCommentId) {
      parentComment =
        (await db.query.comments.findFirst(
          {
            where: and(
              eq(
                comments.id,
                parentCommentId
              ),
              eq(
                comments.storyId,
                storyId
              ),
              eq(
                comments.isDeleted,
                false
              ),
              eq(
                comments.isApproved,
                true
              )
            ),
            columns: {
              id: true,
              userId: true,
            },
          }
        )) ?? null;

      if (!parentComment) {
        return NextResponse.json(
          {
            message:
              "The comment you are replying to was not found.",
          },
          { status: 404 }
        );
      }

      if (
        parentComment.userId ===
        user.id
      ) {
        return NextResponse.json(
          {
            message:
              "You cannot reply to your own comment.",
          },
          { status: 400 }
        );
      }
    }

    const [comment] =
      await db
        .insert(comments)
        .values({
          storyId,
          userId: user.id,
          parentCommentId,
          content,
          isApproved: true,
        })
        .returning({
          id: comments.id,
          content:
            comments.content,
          parentCommentId:
            comments.parentCommentId,
          createdAt:
            comments.createdAt,
          updatedAt:
            comments.updatedAt,
        });

    const notificationUserId =
      parentComment
        ? parentComment.userId
        : story.authorId;

    if (
      notificationUserId !==
      user.id
    ) {
      await db
        .insert(notifications)
        .values({
          userId:
            notificationUserId,

          type: parentComment
            ? "reply"
            : "comment",

          message:
            parentComment
              ? `${user.displayName} replied to your comment on "${story.title}".`
              : `${user.displayName} commented on "${story.title}".`,

          link:
            `/stories/${story.slug}`,

          storyId:
            story.id,

          commentId:
            comment.id,
        });
    }

    return NextResponse.json(
      {
        message:
          parentComment
            ? "Reply added successfully."
            : "Comment added successfully.",

        comment: {
          id: comment.id,
          content:
            comment.content,
          parentCommentId:
            comment.parentCommentId,
          createdAt:
            comment.createdAt,
          updatedAt:
            comment.updatedAt,

          user: {
            id: user.id,
            displayName:
              user.displayName,
            profileImage:
              user.profileImage ??
              null,
          },

          replies: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create comment error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create comment.",
      },
      { status: 500 }
    );
  }
        }
