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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UploadedImage = {
  url: string;
  publicId: string;
};

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
      where: (stories, { and, eq, or }) =>
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id),
          eq(stories.isDeleted, false),
          or(
            eq(stories.status, "draft"),
            eq(stories.status, "pending_review")
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
      { draft },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Fetch draft/pending-review story error:",
      error
    );

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

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

    const uploadedImages: UploadedImage[] =
      Array.isArray(data.storyImages)
        ? data.storyImages
            .filter(
              (image): image is UploadedImage =>
                Boolean(
                  image &&
                    typeof image === "object" &&
                    typeof (image as Record<string, unknown>)
                      .url === "string" &&
                    typeof (image as Record<string, unknown>)
                      .publicId === "string"
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
    | Basic validation
    |--------------------------------------------------------------------------
    */

    if (!title) {
      return NextResponse.json(
        { message: "Please enter a story title." },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { message: "Please write your story." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { message: "Please select a category." },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { message: "Invalid story status." },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find the story owned by the authenticated user
    |--------------------------------------------------------------------------
    */

    const existingStory =
      await db.query.stories.findFirst({
        where: (stories, { and, eq, or }) =>
          and(
            eq(stories.id, id),
            eq(stories.authorId, user.id),
            eq(stories.isDeleted, false),
            or(
              eq(stories.status, "draft"),
              eq(stories.status, "pending_review")
            )
          ),
      });

    if (!existingStory) {
      return NextResponse.json(
        {
          message:
            "Draft or pending-review story not found.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find category
    |--------------------------------------------------------------------------
    */

    const existingCategory =
      await db.query.categories.findFirst({
        where: (categories, { and, eq }) =>
          and(
            eq(categories.name, category),
            eq(categories.isActive, true)
          ),
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          message:
            "The selected category is not available.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Determine status
    |--------------------------------------------------------------------------
    |
    | Draft:
    |     remains draft.
    |
    | Publish:
    |     becomes pending_review.
    |
    | Existing pending-review story:
    |     remains pending_review when edited.
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
    | Submission type
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
    | Activity logging is secondary.
    |
    | If it fails, the story has STILL been successfully
    | saved. Therefore activity failure must NOT turn the
    | successful save into an HTTP 500 response.
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
      | Do not fail the story operation because activity
      | logging failed.
      */
      console.error(
        "Story activity logging failed:",
        activityError
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Success response
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
      { status: 200 }
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
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    /*
    |--------------------------------------------------------------------------
    | Only the owner can delete their draft.
    | Pending-review and published stories cannot be
    | deleted through this endpoint.
    |--------------------------------------------------------------------------
    */

    const draft =
      await db.query.stories.findFirst({
        where: (stories, { and, eq }) =>
          and(
            eq(stories.id, id),
            eq(stories.authorId, user.id),
            eq(stories.status, "draft"),
            eq(stories.isDeleted, false)
          ),
      });

    if (!draft) {
      return NextResponse.json(
        { message: "Draft not found." },
        { status: 404 }
      );
    }

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
      { status: 200 }
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
      { status: 500 }
    );
  }
  }
