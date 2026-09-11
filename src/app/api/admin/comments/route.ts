import { NextResponse } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import {
  comments,
  stories,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      {
        message: "Forbidden.",
      },
      { status: 403 }
    );
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load comments for the Admin moderation page.
|
| This is completely separate from the public comments API.
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request
) {
  try {
    const authError =
      await requireAdmin();

    if (authError) {
      return authError;
    }

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams
        .get("search")
        ?.trim() ?? "";

    const status =
      searchParams
        .get("status")
        ?.trim() ?? "all";

    const pageParam = Number(
      searchParams.get("page") ?? "1"
    );

    const limitParam = Number(
      searchParams.get("limit") ?? "20"
    );

    const page =
      Number.isFinite(pageParam) &&
      pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) &&
      limitParam > 0
        ? Math.min(
            Math.floor(limitParam),
            50
          )
        : 20;

    const offset =
      (page - 1) * limit;

    const conditions = [];

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (search) {
      conditions.push(
        or(
          ilike(
            comments.content,
            `%${search}%`
          ),
          ilike(
            comments.anonymousName,
            `%${search}%`
          ),
          ilike(
            users.displayName,
            `%${search}%`
          ),
          ilike(
            users.email,
            `%${search}%`
          ),
          ilike(
            stories.title,
            `%${search}%`
          )
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    */

    if (status === "visible") {
      conditions.push(
        and(
          eq(
            comments.isApproved,
            true
          ),
          eq(
            comments.isDeleted,
            false
          )
        )
      );
    }

    if (status === "hidden") {
      conditions.push(
        and(
          eq(
            comments.isApproved,
            false
          ),
          eq(
            comments.isDeleted,
            false
          )
        )
      );
    }

    if (status === "deleted") {
      conditions.push(
        eq(
          comments.isDeleted,
          true
        )
      );
    }

    const whereCondition =
      conditions.length > 0
        ? and(...conditions)
        : undefined;

    /*
    |--------------------------------------------------------------------------
    | COMMENTS
    |--------------------------------------------------------------------------
    */

    const [rows, totalRows] =
      await Promise.all([
        db
          .select({
            id: comments.id,
            storyId:
              comments.storyId,

            userId:
              comments.userId,

            anonymousName:
              comments.anonymousName,

            guestName:
              comments.guestName,

            parentCommentId:
              comments.parentCommentId,

            content:
              comments.content,

            isApproved:
              comments.isApproved,

            isDeleted:
              comments.isDeleted,

            createdAt:
              comments.createdAt,

            updatedAt:
              comments.updatedAt,

            authorName:
              users.displayName,

            authorEmail:
              users.email,

            storyTitle:
              stories.title,

            storySlug:
              stories.slug,
          })
          .from(comments)
          .leftJoin(
            users,
            eq(
              comments.userId,
              users.id
            )
          )
          .innerJoin(
            stories,
            eq(
              comments.storyId,
              stories.id
            )
          )
          .where(
            whereCondition
          )
          .orderBy(
            desc(
              comments.createdAt
            ),
            asc(comments.id)
          )
          .limit(limit)
          .offset(offset),

        db
          .select({
            count: count(),
          })
          .from(comments)
          .leftJoin(
            users,
            eq(
              comments.userId,
              users.id
            )
          )
          .innerJoin(
            stories,
            eq(
              comments.storyId,
              stories.id
            )
          )
          .where(
            whereCondition
          ),
      ]);

    const total = Number(
      totalRows[0]?.count ?? 0
    );

    const totalPages = Math.max(
      1,
      Math.ceil(
        total / limit
      )
    );

    const formattedComments =
      rows.map((comment) => ({
        id: comment.id,

        story: {
          id: comment.storyId,
          title: comment.storyTitle,
          slug: comment.storySlug,
        },

        author: comment.userId
          ? {
              type: "registered" as const,
              id: comment.userId,
              name:
                comment.authorName ??
                "User",
              email:
                comment.authorEmail ??
                "",
            }
          : {
              type: "anonymous" as const,
              id: null,
              name:
                comment.anonymousName ??
                comment.guestName ??
                "Anonymous",
              email: "",
            },

        type: comment.parentCommentId
          ? ("reply" as const)
          : ("comment" as const),

        parentCommentId:
          comment.parentCommentId,

        content: comment.content,

        status: comment.isDeleted
          ? ("deleted" as const)
          : comment.isApproved
          ? ("visible" as const)
          : ("hidden" as const),

        isApproved:
          comment.isApproved,

        isDeleted:
          comment.isDeleted,

        createdAt:
          comment.createdAt,

        updatedAt:
          comment.updatedAt,
      }));

    return NextResponse.json(
      {
        comments:
          formattedComments,

        pagination: {
          page,
          limit,
          total,
          totalPages,
        },

        search,
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin moderation GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load comments.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
| Moderate one comment.
|
| Supported actions:
|
| hide
| restore
| delete
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request
) {
  try {
    const authError =
      await requireAdmin();

    if (authError) {
      return authError;
    }

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid request.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid request.",
        },
        { status: 400 }
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    const commentId =
      typeof data.commentId ===
      "string"
        ? data.commentId.trim()
        : "";

    const action =
      typeof data.action ===
      "string"
        ? data.action
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

    if (
      action !== "hide" &&
      action !== "restore" &&
      action !== "delete"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid moderation action.",
        },
        { status: 400 }
      );
    }

    const existingComment =
      await db.query.comments.findFirst(
        {
          where: eq(
            comments.id,
            commentId
          ),
          columns: {
            id: true,
            isApproved: true,
            isDeleted: true,
          },
        }
      );

    if (!existingComment) {
      return NextResponse.json(
        {
          message:
            "Comment not found.",
        },
        { status: 404 }
      );
    }

    const updatedAt =
      new Date();

    let updateData: {
      isApproved?: boolean;
      isDeleted?: boolean;
      updatedAt: Date;
    };

    if (action === "hide") {
      updateData = {
        isApproved: false,
        isDeleted: false,
        updatedAt,
      };
    } else if (
      action === "restore"
    ) {
      updateData = {
        isApproved: true,
        isDeleted: false,
        updatedAt,
      };
    } else {
      updateData = {
        isDeleted: true,
        updatedAt,
      };
    }

    const [
      updatedComment,
    ] = await db
      .update(comments)
      .set(updateData)
      .where(
        eq(
          comments.id,
          commentId
        )
      )
      .returning({
        id: comments.id,
        isApproved:
          comments.isApproved,
        isDeleted:
          comments.isDeleted,
        updatedAt:
          comments.updatedAt,
      });

    if (!updatedComment) {
      return NextResponse.json(
        {
          message:
            "Unable to update comment.",
        },
        { status: 500 }
      );
    }

    const message =
      action === "hide"
        ? "Comment hidden successfully."
        : action === "restore"
        ? "Comment restored successfully."
        : "Comment deleted successfully.";

    return NextResponse.json(
      {
        success: true,
        message,
        comment:
          updatedComment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin moderation PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to moderate this comment.",
      },
      { status: 500 }
    );
  }
  }
