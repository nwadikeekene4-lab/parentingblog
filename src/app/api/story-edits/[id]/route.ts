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
| Load a published story or its existing pending revision.
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

    /*
    |--------------------------------------------------------------------------
    | Load an existing pending revision if one exists.
    |--------------------------------------------------------------------------
    */

    const pendingRevisionResult = await db
      .select()
      .from(storyRevisions)
      .where(
        and(
          eq(storyRevisions.storyId, story.id),
          eq(storyRevisions.status, "pending_review")
        )
      )
      .limit(1);

    const existingRevision =
      pendingRevisionResult[0];

    if (existingRevision) {
      const revisionImages = await db
        .select({
          id: storyRevisionImages.id,
          imageUrl: storyRevisionImages.imageUrl,
          publicId: storyRevisionImages.publicId,
          caption: storyRevisionImages.caption,
          displayOrder:
            storyRevisionImages.displayOrder,
        })
        .from(storyRevisionImages)
        .where(
          eq(
            storyRevisionImages.revisionId,
            existingRevision.id
          )
        )
        .orderBy(
          storyRevisionImages.displayOrder
        );

      let revisionCategoryName = story.category;

      if (
        existingRevision.categoryId !==
        story.categoryId
      ) {
        const categoryResult = await db
          .select({
            name: categories.name,
          })
          .from(categories)
          .where(
            eq(
              categories.id,
              existingRevision.categoryId
            )
          )
          .limit(1);

        if (categoryResult[0]) {
          revisionCategoryName =
            categoryResult[0].name;
        }
      }

      return NextResponse.json({
        story: {
          ...story,
          title: existingRevision.title,
          content: existingRevision.content,
          excerpt: existingRevision.excerpt,
          slug: existingRevision.slug,
          coverImage:
            existingRevision.coverImage,
          coverImagePublicId:
            existingRevision.coverImagePublicId,
          categoryId:
            existingRevision.categoryId,
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
| Create or update the pending revision of a published story.
|
| IMPORTANT:
| The currently published story is NEVER modified here.
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authenticate
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Parse request body
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Validate text fields
    |--------------------------------------------------------------------------
    */

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

    let coverImageUrl:
      | string
      | null
      | undefined;

    let coverImagePublicId:
      | string
      | null
      | undefined;

    if (body.coverImageUrl !== undefined) {
      if (
        body.coverImageUrl !== null &&
        typeof body.coverImageUrl !== "string"
      ) {
        return NextResponse.json(
          {
            message:
              "The cover image URL is invalid.",
          },
          { status: 400 }
        );
      }

      coverImageUrl =
        typeof body.coverImageUrl === "string"
          ? body.coverImageUrl.trim()
          : null;
    }

    if (
      body.coverImagePublicId !== undefined
    ) {
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
    |
    | IMPORTANT:
    |
    | storyImages: undefined
    |   = the client did not provide an image list.
    |
    | storyImages: []
    |   = the user intentionally has ZERO additional images.
    |
    | storyImages: [...]
    |   = this exact list becomes the revision image set.
    |
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

      const parsedImages: ImageInput[] = [];

      for (
        const image of body.storyImages
      ) {
        if (
          !image ||
          typeof image !== "object"
        ) {
          continue;
        }

        const item =
          image as Record<string, unknown>;

        if (
          typeof item.url !== "string" ||
          typeof item.publicId !== "string"
        ) {
          continue;
        }

        const url = item.url.trim();
        const publicId =
          item.publicId.trim();

        /*
        |--------------------------------------------------------------------------
        | Ignore incomplete image records.
        |
        | The database requires both URL and publicId.
        |--------------------------------------------------------------------------
        */

        if (!url || !publicId) {
          continue;
        }

        parsedImages.push({
          url,
          publicId,
          caption:
            typeof item.caption === "string"
              ? item.caption.trim()
              : null,
        });
      }

      images = parsedImages;
    }

    /*
    |--------------------------------------------------------------------------
    | Find the original published story.
    |--------------------------------------------------------------------------
    */

    const storyResult = await db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id),
          eq(stories.status, "published"),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    const story = storyResult[0];

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
    | Find the selected active category.
    |--------------------------------------------------------------------------
    */

    const categoryResult = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, category),
          eq(categories.isActive, true)
        )
      )
      .limit(1);

    const categoryRow =
      categoryResult[0];

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
    | Find existing pending revision.
    |--------------------------------------------------------------------------
    */

    const revisionResult = await db
      .select()
      .from(storyRevisions)
      .where(
        and(
          eq(
            storyRevisions.storyId,
            story.id
          ),
          eq(
            storyRevisions.status,
            "pending_review"
          )
        )
      )
      .limit(1);

    const existingRevision =
      revisionResult[0];

    /*
    |--------------------------------------------------------------------------
    | Generate revision slug.
    |
    | The published story's slug is untouched.
    |--------------------------------------------------------------------------
    */

    const baseSlug =
      slugify(title) ||
      `story-${Date.now()}`;

    let revisionSlug = baseSlug;
    let counter = 1;

    while (true) {
      const slugResult = await db
        .select({
          id: stories.id,
        })
        .from(stories)
        .where(
          eq(
            stories.slug,
            revisionSlug
          )
        )
        .limit(1);

      const existingStory =
        slugResult[0];

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
    | If cover information was not supplied,
    | preserve the currently published cover.
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
    | Create or update revision atomically.
    |--------------------------------------------------------------------------
    */

    const revision =
      await db.transaction(async (tx) => {
        let revisionId: string;

        /*
        |--------------------------------------------------------------------------
        | UPDATE existing pending revision
        |--------------------------------------------------------------------------
        */

        if (existingRevision) {
          const updatedResult =
            await tx
              .update(storyRevisions)
              .set({
                title,
                slug: revisionSlug,
                excerpt:
                  generateExcerpt(content),
                content,
                coverImage:
                  revisionCoverImage,
                coverImagePublicId:
                  revisionCoverPublicId,
                categoryId:
                  categoryRow.id,
                updatedAt: new Date(),
              })
              .where(
                eq(
                  storyRevisions.id,
                  existingRevision.id
                )
              )
              .returning({
                id: storyRevisions.id,
                storyId:
                  storyRevisions.storyId,
                authorId:
                  storyRevisions.authorId,
                status:
                  storyRevisions.status,
              });

          const updatedRevision =
            updatedResult[0];

          if (!updatedRevision) {
            throw new Error(
              "The pending story revision could not be updated."
            );
          }

          revisionId =
            updatedRevision.id;

          /*
          |--------------------------------------------------------------------------
          | The new submitted image list completely replaces
          | the old pending revision image list.
          |--------------------------------------------------------------------------
          */

          await tx
            .delete(storyRevisionImages)
            .where(
              eq(
                storyRevisionImages.revisionId,
                revisionId
              )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE new pending revision
        |--------------------------------------------------------------------------
        */

        else {
          const insertedResult =
            await tx
              .insert(storyRevisions)
              .values({
                storyId: story.id,
                authorId: user.id,
                title,
                slug: revisionSlug,
                excerpt:
                  generateExcerpt(content),
                content,
                coverImage:
                  revisionCoverImage,
                coverImagePublicId:
                  revisionCoverPublicId,
                categoryId:
                  categoryRow.id,
                status: "pending_review",
                feedback: null,
                reviewedAt: null,
                reviewerId: null,
              })
              .returning({
                id: storyRevisions.id,
                storyId:
                  storyRevisions.storyId,
                authorId:
                  storyRevisions.authorId,
                status:
                  storyRevisions.status,
              });

          const insertedRevision =
            insertedResult[0];

          if (!insertedRevision) {
            throw new Error(
              "The story revision could not be created."
            );
          }

          revisionId =
            insertedRevision.id;
        }

        /*
        |--------------------------------------------------------------------------
        | Save the exact image state supplied by the editor.
        |--------------------------------------------------------------------------
        |
        | If images === []:
        |   Insert nothing.
        |
        | This intentionally means the author removed all
        | additional story images.
        |--------------------------------------------------------------------------
        */

        if (
          images !== undefined &&
          images.length > 0
        ) {
          await tx
            .insert(storyRevisionImages)
            .values(
              images.map(
                (image, index) => ({
                  revisionId,

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

        /*
        |--------------------------------------------------------------------------
        | If storyImages was NOT supplied at all,
        | preserve the current published images.
        |--------------------------------------------------------------------------
        */

        if (images === undefined) {
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
                    revisionId,

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

        /*
        |--------------------------------------------------------------------------
        | Return the final revision from inside the transaction.
        |--------------------------------------------------------------------------
        */

        const finalRevisionResult =
          await tx
            .select({
              id: storyRevisions.id,
              storyId:
                storyRevisions.storyId,
              status:
                storyRevisions.status,
            })
            .from(storyRevisions)
            .where(
              eq(
                storyRevisions.id,
                revisionId
              )
            )
            .limit(1);

        const finalRevision =
          finalRevisionResult[0];

        if (!finalRevision) {
          throw new Error(
            "The story revision could not be confirmed after saving."
          );
        }

        return finalRevision;
      });

    /*
    |--------------------------------------------------------------------------
    | Notify the author.
    |
    | Notification failure must NOT undo a successfully
    | saved revision.
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
            "/users-dashboard/my-stories",
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

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Return a useful server-side error message.
    |
    | This does not expose database internals.
    |--------------------------------------------------------------------------
    */

    if (error instanceof Error) {
      const message =
        error.message.toLowerCase();

      if (
        message.includes(
          "duplicate"
        ) ||
        message.includes(
          "unique constraint"
        )
      ) {
        return NextResponse.json(
          {
            message:
              "A pending version of this story already exists. Please refresh the editor and try again.",
          },
          { status: 409 }
        );
      }

      if (
        message.includes(
          "foreign key"
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Some story information is no longer valid. Please refresh the editor and try again.",
          },
          { status: 400 }
        );
      }

      if (
        message.includes(
          "pending story revision"
        ) ||
        message.includes(
          "story revision could not"
        )
      ) {
        return NextResponse.json(
          {
            message:
              "The story changes could not be saved. Please refresh the editor and try again.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Unable to submit your story changes for review. Please try again.",
      },
      { status: 500 }
    );
  }
            }
