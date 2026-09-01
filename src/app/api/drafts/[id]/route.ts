import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { createActivity } from "@/lib/activity";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UploadedImage = {
  url: string;
  publicId: string;
};

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load a draft or pending-review story belonging to the
| currently authenticated user.
|--------------------------------------------------------------------------
*/

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const draft = await db.query.stories.findFirst({
      where: (story, { and, eq, or }) =>
        and(
          eq(story.id, id),
          eq(story.authorId, user.id),
          eq(story.isDeleted, false),
          or(
            eq(story.status, "draft"),
            eq(story.status, "pending_review")
          )
        ),
      with: {
        category: true,
        images: true,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { message: "Story not found." },
        { status: 404 }
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
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
| Update a draft or pending-review story.
|
| Draft:
|   draft → draft
|
| Publish:
|   draft → pending_review
|
| Pending review edit:
|   pending_review → pending_review
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

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
    | Parse request
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
    | Read and sanitize fields
    |--------------------------------------------------------------------------
    */

    const title =
      typeof data.title === "string"
        ? data.title.trim()
        : "";

    const content =
      typeof data.content === "string"
        ? data.content.trim()
        : "";

    const category =
      typeof data.category === "string"
        ? data.category.trim()
        : "";

    const status =
      data.status === "draft" ||
      data.status === "published"
        ? data.status
        : null;

    const coverImageUrl =
      typeof data.coverImageUrl === "string" &&
      data.coverImageUrl.trim().length > 0
        ? data.coverImageUrl.trim()
        : null;

    const coverImagePublicId =
      typeof data.coverImagePublicId === "string" &&
      data.coverImagePublicId.trim().length > 0
        ? data.coverImagePublicId.trim()
        : null;

    /*
    |--------------------------------------------------------------------------
    | Story images
    |--------------------------------------------------------------------------
    */

    const uploadedImages: UploadedImage[] =
      Array.isArray(data.storyImages)
        ? data.storyImages
            .filter(
              (image): image is UploadedImage =>
                Boolean(
                  image &&
                    typeof image === "object" &&
                    typeof (
                      image as Record<string, unknown>
                    ).url === "string" &&
                    typeof (
                      image as Record<string, unknown>
                    ).publicId === "string"
                )
            )
            .slice(0, 20)
            .map((image) => ({
              url: image.url.trim(),
              publicId: image.publicId.trim(),
            }))
            .filter(
              (image) =>
                image.url.length > 0 &&
                image.publicId.length > 0
            )
        : [];

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!title) {
      return NextResponse.json(
        {
          message: "Please enter a story title.",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          message: "Please write your story.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          message: "Please select a category.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          message: "Invalid story status.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find existing story
    |--------------------------------------------------------------------------
    |
    | The authenticated user's ID is always checked.
    | This prevents one user from editing another user's story.
    |--------------------------------------------------------------------------
    */

    const existingStory =
      await db.query.stories.findFirst({
        where: (story, { and, eq, or }) =>
          and(
            eq(story.id, id),
            eq(story.authorId, user.id),
            eq(story.isDeleted, false),
            or(
              eq(story.status, "draft"),
              eq(story.status, "pending_review")
            )
          ),
      });

    if (!existingStory) {
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
    | Find active category
    |--------------------------------------------------------------------------
    */

    const existingCategory =
      await db.query.categories.findFirst({
        where: (categoryRecord, { and, eq }) =>
          and(
            eq(categoryRecord.name, category),
            eq(categoryRecord.isActive, true)
          ),
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          message:
            "The selected category is not available.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Determine new story status
    |--------------------------------------------------------------------------
    */

    const newStatus =
      existingStory.status === "pending_review"
        ? "pending_review"
        : status === "published"
          ? "pending_review"
          : "draft";

    /*
    |--------------------------------------------------------------------------
    | Determine submission type
    |--------------------------------------------------------------------------
    |
    | A brand-new submission:
    |   new_submission
    |
    | Editing an already pending story:
    |   story_update
    |--------------------------------------------------------------------------
    */

    const submissionType =
      existingStory.status === "pending_review"
        ? "story_update"
        : "new_submission";

    /*
    |--------------------------------------------------------------------------
    | Published date
    |--------------------------------------------------------------------------
    */

    const publishedAt =
      newStatus === "pending_review"
        ? existingStory.publishedAt ?? new Date()
        : null;

    /*
    |--------------------------------------------------------------------------
    | Update story
    |--------------------------------------------------------------------------
    */

    await db
      .update(stories)
      .set({
        title,
        content,

        excerpt: content
          .split(/\s+/)
          .slice(0, 40)
          .join(" "),

        categoryId: existingCategory.id,

        coverImage: coverImageUrl,

        coverImagePublicId:
          coverImagePublicId,

        status: newStatus,

        submissionType,

        publishedAt,

        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id)
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
        eq(storyImages.storyId, id)
      );

    if (uploadedImages.length > 0) {
      await db
        .insert(storyImages)
        .values(
          uploadedImages.map(
            (image, index) => ({
              storyId: id,
              imageUrl: image.url,
              publicId: image.publicId,
              displayOrder: index,
            })
          )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Activity logging
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Activity logging is NOT allowed to make the story
    | save appear to have failed.
    |--------------------------------------------------------------------------
    */

    try {
      if (
        existingStory.status === "pending_review"
      ) {
        await createActivity({
          userId: user.id,
          type: "story_edited",
          message: `You edited "${title}".`,
          storyId: id,
        });
      } else if (status === "published") {
        await createActivity({
          userId: user.id,
          type: "story_submitted",
          message: `You submitted "${title}" for review.`,
          storyId: id,
        });
      } else {
        await createActivity({
          userId: user.id,
          type: "story_draft_saved",
          message: `You saved "${title}" as a draft.`,
          storyId: id,
        });
      }
    } catch (activityError) {
      /*
      |--------------------------------------------------------------------------
      | Activity failure must NOT fail the story save.
      |--------------------------------------------------------------------------
      */

      console.error(
        "Story activity logging failed:",
        activityError
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        message:
          newStatus === "pending_review"
            ? existingStory.status ===
              "pending_review"
              ? "Story updated successfully."
              : "Story submitted for review successfully."
            : "Draft saved successfully.",

        status: newStatus,

        storyId: id,
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
          "Unable to save your story. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| Only draft stories can be deleted through this endpoint.
|--------------------------------------------------------------------------
*/

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

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
    | Find user's draft
    |--------------------------------------------------------------------------
    */

    const draft =
      await db.query.stories.findFirst({
        where: (story, { and, eq }) =>
          and(
            eq(story.id, id),
            eq(story.authorId, user.id),
            eq(story.status, "draft"),
            eq(story.isDeleted, false)
          ),
      });

    if (!draft) {
      return NextResponse.json(
        {
          message: "Draft not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Soft delete
    |--------------------------------------------------------------------------
    */

    await db
      .update(stories)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id),
          eq(stories.status, "draft")
        )
      );

    return NextResponse.json(
      {
        success: true,
        message: "Draft deleted successfully.",
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
          "Unable to delete the draft.",
      },
      {
        status: 500,
      }
    );
  }
  }
