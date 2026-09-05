import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
  storyImages,
  storyRevisions,
  storyRevisionImages,
  notifications,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { generateExcerpt } from "@/lib/story";

type ImageInput = {
  url: string;
  publicId: string;
  caption?: string | null;
};

type EditBody = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
  coverImageUrl?: unknown;
  coverImagePublicId?: unknown;
  storyImages?: unknown;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getStoryImages(storyId: string) {
  return db
    .select({
      id: storyImages.id,
      imageUrl: storyImages.imageUrl,
      publicId: storyImages.publicId,
      caption: storyImages.caption,
      displayOrder: storyImages.displayOrder,
    })
    .from(storyImages)
    .where(eq(storyImages.storyId, storyId))
    .orderBy(storyImages.displayOrder);
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load a published story (or its existing pending revision) belonging to the logged-in user.
|--------------------------------------------------------------------------
*/

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Your session has expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message: "The story could not be identified.",
        },
        { status: 400 }
      );
    }

    const result = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        excerpt: stories.excerpt,
        slug: stories.slug,
        coverImage: stories.coverImage,
        coverImagePublicId: stories.coverImagePublicId,
        categoryId: stories.categoryId,
        category: categories.name,
        status: stories.status,
        publishedAt: stories.publishedAt,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .innerJoin(
        categories,
        eq(stories.categoryId, categories.id)
      )
      .where(
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id),
          eq(stories.status, "published"),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    const story = result[0];

    if (!story) {
      return NextResponse.json(
        {
          message:
            "This published story could not be found or you do not have permission to edit it.",
        },
        { status: 404 }
      );
    }

    // Check if there is already a pending revision for this story so the author can continue editing it
    const existingRevision = await db.query.storyRevisions.findFirst({
      where: (revision, { and, eq }) =>
        and(
          eq(revision.storyId, story.id),
          eq(revision.status, "pending_review")
        ),
    });

    if (existingRevision) {
      const revisionImages = await db
        .select({
          id: storyRevisionImages.id,
          imageUrl: storyRevisionImages.imageUrl,
          publicId: storyRevisionImages.publicId,
          caption: storyRevisionImages.caption,
          displayOrder: storyRevisionImages.displayOrder,
        })
        .from(storyRevisionImages)
        .where(eq(storyRevisionImages.revisionId, existingRevision.id))
        .orderBy(storyRevisionImages.displayOrder);

      let revisionCategoryName = story.category;
      if (existingRevision.categoryId !== story.categoryId) {
        const [revCat] = await db
          .select({ name: categories.name })
          .from(categories)
          .where(eq(categories.id, existingRevision.categoryId))
          .limit(1);
        if (revCat) revisionCategoryName = revCat.name;
      }

      return NextResponse.json({
        story: {
          ...story,
          title: existingRevision.title,
          content: existingRevision.content,
          excerpt: existingRevision.excerpt,
          slug: existingRevision.slug,
          coverImage: existingRevision.coverImage,
          coverImagePublicId: existingRevision.coverImagePublicId,
          categoryId: existingRevision.categoryId,
          category: revisionCategoryName,
          images: revisionImages,
        },
      });
    }

    const images = await getStoryImages(id);

    return NextResponse.json({
      story: {
        ...story,
        images,
      },
    });
  } catch (error) {
    console.error(
      "GET published story edit error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "We couldn't load this story right now. Please try again.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
| Create or update a revision of a published story.
|
| IMPORTANT:
| The published stories table is NOT modified here.
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Your session has expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message: "The story could not be identified.",
        },
        { status: 400 }
      );
    }

    let body: EditBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          message: "Please enter a story title.",
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          message: "Please write your story.",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          message: "Please select a category.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate cover image
    |--------------------------------------------------------------------------
    */

    let coverImageUrl: string | null | undefined;
    let coverImagePublicId: string | null | undefined;

    if (body.coverImageUrl !== undefined) {
      if (
        body.coverImageUrl !== null &&
        typeof body.coverImageUrl !== "string"
      ) {
        return NextResponse.json(
          {
            message: "The cover image URL is invalid.",
          },
          { status: 400 }
        );
      }

      coverImageUrl =
        typeof body.coverImageUrl === "string"
          ? body.coverImageUrl.trim()
          : null;
    }

    if (body.coverImagePublicId !== undefined) {
      if (
        body.coverImagePublicId !== null &&
        typeof body.coverImagePublicId !== "string"
      ) {
        return NextResponse.json(
          {
            message:
              "The cover image identifier is invalid.",
          },
          { status: 400 }
        );
      }

      coverImagePublicId =
        typeof body.coverImagePublicId === "string"
          ? body.coverImagePublicId.trim()
          : null;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate story images
    |--------------------------------------------------------------------------
    */

    let images: ImageInput[] | undefined;

    if (body.storyImages !== undefined) {
      if (!Array.isArray(body.storyImages)) {
        return NextResponse.json(
          {
            message:
              "Story images must be provided as a list.",
          },
          { status: 400 }
        );
      }

      if (body.storyImages.length > 20) {
        return NextResponse.json(
          {
            message:
              "A story can contain a maximum of 20 additional images.",
          },
          { status: 400 }
        );
      }

      images = body.storyImages.map(
        (image): ImageInput | null => {
          if (
            !image ||
            typeof image !== "object"
          ) {
            return null;
          }

          const item =
            image as Record<string, unknown>;

          if (
            typeof item.url !== "string" ||
            typeof item.publicId !== "string"
          ) {
            return null;
          }

          return {
            url: item.url.trim(),
            publicId: item.publicId.trim(),
            caption:
              typeof item.caption === "string"
                ? item.caption.trim()
                : null,
          };
        }
      ).filter(
        (image): image is ImageInput =>
          Boolean(
            image &&
            image.url &&
            image.publicId
          )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find the original published story
    |--------------------------------------------------------------------------
    */

    const story = await db.query.stories.findFirst({
      where: (storyTable, { and, eq }) =>
        and(
          eq(storyTable.id, id),
          eq(storyTable.authorId, user.id),
          eq(storyTable.status, "published"),
          eq(storyTable.isDeleted, false)
        ),
    });

    if (!story) {
      return NextResponse.json(
        {
          message:
            "This story cannot be edited because it was not found or is no longer published.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check for existing pending revision (supports updating existing revision instead of duplicate errors)
    |--------------------------------------------------------------------------
    */

    const existingRevision =
      await db.query.storyRevisions.findFirst({
        where: (revision, { and, eq }) =>
          and(
            eq(revision.storyId, story.id),
            eq(
              revision.status,
              "pending_review"
            )
          ),
      });

    /*
    |--------------------------------------------------------------------------
    | Find category
    |--------------------------------------------------------------------------
    */

    const categoryRow =
      await db.query.categories.findFirst({
        where: (categoryTable, { and, eq }) =>
          and(
            eq(categoryTable.name, category),
            eq(categoryTable.isActive, true)
          ),
      });

    if (!categoryRow) {
      return NextResponse.json(
        {
          message:
            "The selected category is not available.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate the future slug.
    |
    | The published story itself keeps its current slug until
    | the administrator approves the revision.
    |--------------------------------------------------------------------------
    */

    const baseSlug =
      slugify(title) ||
      `story-${Date.now()}`;

    let revisionSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existingStory =
        await db.query.stories.findFirst({
          where: (storyTable, { eq }) =>
            eq(
              storyTable.slug,
              revisionSlug
            ),
        });

      if (
        !existingStory ||
        existingStory.id === story.id
      ) {
        break;
      }

      revisionSlug =
        `${baseSlug}-${counter}`;

      counter++;
    }

    /*
    |--------------------------------------------------------------------------
    | Determine cover image.
    |
    | If the client did not send cover information, preserve
    | the currently published cover.
    |--------------------------------------------------------------------------
    */

    const revisionCoverImage =
      body.coverImageUrl === undefined
        ? story.coverImage
        : coverImageUrl ?? null;

    const revisionCoverPublicId =
      body.coverImagePublicId === undefined
        ? story.coverImagePublicId
        : coverImagePublicId ?? null;

    /*
    |--------------------------------------------------------------------------
    | Create or Update revision + revision images atomically.
    |--------------------------------------------------------------------------
    */

    const revision =
      await db.transaction(async (tx) => {
        let createdRevision;

        if (existingRevision) {
          // Update the existing pending revision rather than creating duplicates
          const [updated] = await tx
            .update(storyRevisions)
            .set({
              title,
              slug: revisionSlug,
              excerpt: generateExcerpt(content),
              content,
              coverImage: revisionCoverImage,
              coverImagePublicId: revisionCoverPublicId,
              categoryId: categoryRow.id,
              updatedAt: new Date(),
            })
            .where(eq(storyRevisions.id, existingRevision.id))
            .returning();

          createdRevision = updated;

          // Clear old revision images before inserting updated set
          await tx
            .delete(storyRevisionImages)
            .where(eq(storyRevisionImages.revisionId, existingRevision.id));
        } else {
          // Create new pending revision
          const [inserted] = await tx
            .insert(storyRevisions)
            .values({
              storyId: story.id,
              authorId: user.id,
              title,
              slug: revisionSlug,
              excerpt: generateExcerpt(content),
              content,
              coverImage: revisionCoverImage,
              coverImagePublicId: revisionCoverPublicId,
              categoryId: categoryRow.id,
              status: "pending_review",
              feedback: null,
              reviewedAt: null,
              reviewerId: null,
            })
            .returning();

          createdRevision = inserted;
        }

        if (images !== undefined) {
          if (images.length > 0) {
            await tx
              .insert(storyRevisionImages)
              .values(
                images.map(
                  (image, index) => ({
                    revisionId:
                      createdRevision.id,

                    imageUrl:
                      image.url,

                    publicId:
                      image.publicId,

                    caption:
                      image.caption ?? null,

                    displayOrder:
                      index,
                  })
                )
              );
          }
        } else {
          /*
          |--------------------------------------------------------------------------
          | No new image list was supplied.
          | Copy the current published images into the revision.
          |--------------------------------------------------------------------------
          */

          const currentImages =
            await tx
              .select({
                imageUrl:
                  storyImages.imageUrl,
                publicId:
                  storyImages.publicId,
                caption:
                  storyImages.caption,
                displayOrder:
                  storyImages.displayOrder,
              })
              .from(storyImages)
              .where(
                eq(
                  storyImages.storyId,
                  story.id
                )
              )
              .orderBy(
                storyImages.displayOrder
              );

          if (currentImages.length > 0) {
            await tx
              .insert(storyRevisionImages)
              .values(
                currentImages.map(
                  (image) => ({
                    revisionId:
                      createdRevision.id,

                    imageUrl:
                      image.imageUrl,

                    publicId:
                      image.publicId,

                    caption:
                      image.caption,

                    displayOrder:
                      image.displayOrder,
                  })
                )
              );
          }
        }

        return createdRevision;
      });

    /*
    |--------------------------------------------------------------------------
    | Notify author
    |--------------------------------------------------------------------------
    */

    try {
      await db
        .insert(notifications)
        .values({
          userId: user.id,
          type: "system",
          message:
            `Your changes to "${story.title}" have been submitted for administrator review.`,
          link:
            `/users-dashboard/my-stories`,
          storyId: story.id,
          commentId: null,
          isRead: false,
        });
    } catch (notificationError) {
      console.error(
        "Revision notification failed:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your changes have been submitted for administrator review. Your published story remains unchanged until the review is approved.",
        revision: {
          id: revision.id,
          storyId: revision.storyId,
          status: revision.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create story revision error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to submit your story changes for review. Please try again.",
      },
      { status: 500 }
    );
  }
  }
    
