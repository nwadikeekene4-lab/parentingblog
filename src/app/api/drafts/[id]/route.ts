import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { createActivity } from "@/lib/activity";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const draft =
      await db.query.stories.findFirst({

        where: (stories, { and, eq, or }) =>
          and(
            eq(
              stories.id,
              id
            ),

            eq(
              stories.authorId,
              user.id
            ),

            or(
              eq(
                stories.status,
                "draft"
              ),

              eq(
                stories.status,
                "pending_review"
              )
            )
          ),

        with: {
          category: true,
          images: true,
        },

      });

    if (!draft) {
      return NextResponse.json(
        {
          message:
            "Story not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        draft,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Fetch draft/pending-review story error:",
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


export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await params;

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

    const body =
      await request.json();

    const {
      title,
      content,
      category,
      status,
      coverImageUrl,
      coverImagePublicId,
      storyImages:
        uploadedImages = [],
    } = body;


    /*
    |--------------------------------------------------------------------------
    | Validate required fields
    |--------------------------------------------------------------------------
    */

    if (
      !title ||
      !content ||
      !category ||
      !status
    ) {

      return NextResponse.json(
        {
          message:
            "Title, content, category and status are required.",
        },
        {
          status: 400,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Validate submitted status
    |--------------------------------------------------------------------------
    */

    if (
      status !== "draft" &&
      status !== "published"
    ) {

      return NextResponse.json(
        {
          message:
            "Invalid story status.",
        },
        {
          status: 400,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Find category
    |--------------------------------------------------------------------------
    */

    const existingCategory =
      await db.query.categories.findFirst({

        where: (
          categories,
          { eq }
        ) =>
          eq(
            categories.name,
            category
          ),

      });


    if (!existingCategory) {

      return NextResponse.json(
        {
          message:
            "Category not found.",
        },
        {
          status: 404,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Find the user's existing story
    |--------------------------------------------------------------------------
    |
    | The story may be:
    |
    | - draft
    | - pending_review
    |
    | Published stories are NOT editable through this route.
    |--------------------------------------------------------------------------
    */

    const existingDraft =
      await db.query.stories.findFirst({

        where: (
          stories,
          { and, eq, or }
        ) =>
          and(

            eq(
              stories.id,
              id
            ),

            eq(
              stories.authorId,
              user.id
            ),

            or(

              eq(
                stories.status,
                "draft"
              ),

              eq(
                stories.status,
                "pending_review"
              )

            ),

          ),

      });


    if (!existingDraft) {

      return NextResponse.json(
        {
          message:
            "Draft or pending-review story not found.",
        },
        {
          status: 404,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Determine the new status
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | If the story is already pending review, editing it keeps it
    | pending review.
    |
    | It does NOT become a draft.
    |
    | It does NOT become published.
    |--------------------------------------------------------------------------
    */

    const newStatus =
      existingDraft.status === "pending_review"
        ? "pending_review"
        : status === "published"
          ? "pending_review"
          : "draft";


    /*
    |--------------------------------------------------------------------------
    | Determine publishedAt
    |--------------------------------------------------------------------------
    |
    | Pending-review edits must preserve the existing publishedAt value.
    |
    | A new draft submitted for review receives a submission date.
    |--------------------------------------------------------------------------
    */

    const newPublishedAt =
      existingDraft.status === "pending_review"
        ? existingDraft.publishedAt
        : status === "published"
          ? new Date()
          : null;


    /*
    |--------------------------------------------------------------------------
    | Update story
    |--------------------------------------------------------------------------
    */

    await db
      .update(stories)
      .set({

        title:
          title.trim(),

        content:
          content.trim(),

        excerpt:
          content
            .trim()
            .split(/\s+/)
            .slice(0, 40)
            .join(" "),

        categoryId:
          existingCategory.id,

        coverImage:
          coverImageUrl ?? null,

        coverImagePublicId:
          coverImagePublicId ?? null,

        status:
          newStatus,

        publishedAt:
          newPublishedAt,

        updatedAt:
          new Date(),

      })

      .where(
        eq(
          stories.id,
          id
        )
      );


    /*
    |--------------------------------------------------------------------------
    | Replace story images
    |--------------------------------------------------------------------------
    */

    await db
      .delete(storyImages)
      .where(
        eq(
          storyImages.storyId,
          id
        )
      );


    if (
      uploadedImages.length > 0
    ) {

      await db
        .insert(storyImages)
        .values(

          uploadedImages.map(

            (
              image: {
                url: string;
                publicId: string;
              },

              index: number

            ) => ({

              storyId:
                id,

              imageUrl:
                image.url,

              publicId:
                image.publicId,

              displayOrder:
                index,

            })

          )

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Record user's activity
    |--------------------------------------------------------------------------
    |
    | Pending-review edit:
    |   story_edited
    |
    | New story submitted:
    |   story_submitted
    |
    | Draft saved:
    |   story_draft_saved
    |--------------------------------------------------------------------------
    */

    if (
      existingDraft.status === "pending_review"
    ) {

      await createActivity({

        userId:
          user.id,

        type:
          "story_edited",

        message:
          `You edited "${title.trim()}".`,

        storyId:
          id,

      });

    } else if (
      status === "published"
    ) {

      await createActivity({

        userId:
          user.id,

        type:
          "story_submitted",

        message:
          `You submitted "${title.trim()}" for review.`,

        storyId:
          id,

      });

    } else {

      await createActivity({

        userId:
          user.id,

        type:
          "story_draft_saved",

        message:
          `You saved "${title.trim()}" as a draft.`,

        storyId:
          id,

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Return response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {

        message:
          existingDraft.status === "pending_review"
            ? "Story updated and remains pending review."
            : status === "published"
              ? "Story submitted for review successfully."
              : "Draft updated successfully.",

      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "Update draft/pending-review story error:",
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


export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await params;

    const user =
      await getCurrentUser();

    if (!user) {

      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | DELETE remains DRAFT ONLY
    |--------------------------------------------------------------------------
    */

    const draft =
      await db.query.stories.findFirst({

        where: (
          stories,
          { and, eq }
        ) =>
          and(

            eq(
              stories.id,
              id
            ),

            eq(
              stories.authorId,
              user.id
            ),

            eq(
              stories.status,
              "draft"
            ),

          ),

      });


    if (!draft) {

      return NextResponse.json(
        {
          message:
            "Draft not found.",
        },
        {
          status: 404,
        }
      );

    }


    await db
      .delete(stories)
      .where(
        eq(
          stories.id,
          id
        )
      );


    return NextResponse.json(
      {
        message:
          "Draft deleted successfully.",
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "Delete draft error:",
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
