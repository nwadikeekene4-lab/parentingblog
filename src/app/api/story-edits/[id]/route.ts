```ts
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { stories, comments, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
    --------------------------------------------------------------------------
    | AUTHENTICATION
    --------------------------------------------------------------------------
    */

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
    --------------------------------------------------------------------------
    | ADMIN / MODERATOR ACCESS
    --------------------------------------------------------------------------
    */

    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "moderator"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    /*
    --------------------------------------------------------------------------
    | READ REQUEST BODY
    --------------------------------------------------------------------------
    */

    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverImagePublicId,
      categoryId,
      status,
      featured,
      submissionType,
    } = body;

    /*
    --------------------------------------------------------------------------
    | CHECK THAT STORY EXISTS
    --------------------------------------------------------------------------
    */

    const existingStory = await db.query.stories.findFirst({
      where: eq(stories.id, id),
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    /*
    --------------------------------------------------------------------------
    | UPDATE STORY
    --------------------------------------------------------------------------
    */

    const updatedStory = await db.transaction(async (tx) => {
      const [story] = await tx
        .update(stories)
        .set({
          ...(title !== undefined && { title }),
          ...(slug !== undefined && { slug }),
          ...(excerpt !== undefined && { excerpt }),
          ...(content !== undefined && { content }),
          ...(coverImage !== undefined && { coverImage }),
          ...(coverImagePublicId !== undefined && {
            coverImagePublicId,
          }),
          ...(categoryId !== undefined && { categoryId }),
          ...(status !== undefined && { status }),
          ...(featured !== undefined && { featured }),
          ...(submissionType !== undefined && {
            submissionType,
          }),
          updatedAt: new Date(),
        })
        .where(eq(stories.id, id))
        .returning();

      /*
      ------------------------------------------------------------------------
      | REMOVE ADMIN COMMENTS
      ------------------------------------------------------------------------
      |
      | Only comments written by accounts whose role is "admin" are removed.
      |
      | Anonymous comments:
      |   userId = NULL
      |   -> NOT removed
      |
      | Normal registered users:
      |   role = "user"
      |   -> NOT removed
      |
      | Moderators:
      |   role = "moderator"
      |   -> NOT removed
      |
      | Administrators:
      |   role = "admin"
      |   -> REMOVED
      ------------------------------------------------------------------------
      */

      const adminComments = await tx
        .select({
          id: comments.id,
        })
        .from(comments)
        .innerJoin(
          users,
          eq(comments.userId, users.id)
        )
        .where(
          and(
            eq(comments.storyId, id),
            eq(users.role, "admin")
          )
        );

      /*
      ------------------------------------------------------------------------
      | DELETE ONLY ADMIN COMMENTS
      ------------------------------------------------------------------------
      |
      | commentLikes, replies, reports and notifications connected to these
      | comments will follow the foreign-key cascade rules defined in the
      | database where applicable.
      ------------------------------------------------------------------------
      */

      if (adminComments.length > 0) {
        for (const comment of adminComments) {
          await tx
            .delete(comments)
            .where(eq(comments.id, comment.id));
        }
      }

      return story;
    });

    return NextResponse.json(
      {
        success: true,
        story: updatedStory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error updating story:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update story",
      },
      { status: 500 }
    );
  }
}
```
