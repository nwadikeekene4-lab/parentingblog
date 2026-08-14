import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
  userActivities,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { generateExcerpt } from "@/lib/story";
import cloudinary from "@/lib/cloudinary";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (error as { message: unknown }).message
    );
  }

  return "Unknown error";
}

type UploadedStoryImage = {
  url: string;
  publicId: string;
  caption?: string | null;
};

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load one pending_review story belonging to the logged-in user.
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
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
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "The story could not be identified.",
        },
        {
          status: 400,
        }
      );
    }

    const story = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        excerpt: stories.excerpt,
        slug: stories.slug,

        coverImage: stories.coverImage,
        coverImagePublicId:
          stories.coverImagePublicId,

        categoryId: stories.categoryId,
        category: categories.name,

        status: stories.status,

        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .innerJoin(
        categories,
        eq(
          stories.categoryId,
          categories.id
        )
      )
      .where(
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id),
          eq(
            stories.status,
            "pending_review"
          ),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    if (story.length === 0) {
      return NextResponse.json(
        {
          message:
            "This story could not be found, or it is no longer available for editing.",
        },
        {
          status: 404,
        }
      );
    }

    const additionalImages =
      await db
        .select({
          id: storyImages.id,
          storyId: storyImages.storyId,
          imageUrl: storyImages.imageUrl,
          publicId: storyImages.publicId,
          caption: storyImages.caption,
          displayOrder:
            storyImages.displayOrder,
        })
        .from(storyImages)
        .where(
          eq(
            storyImages.storyId,
            id
          )
        )
        .orderBy(
          storyImages.displayOrder
        );

    return NextResponse.json(
      {
        story: {
          ...story[0],
          images: additionalImages,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Fetch pending review story error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "We couldn't load this story right now. Please refresh the page and try again.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
| Update one pending_review story belonging to the logged-in user.
|
| IMPORTANT:
|
| - status is NEVER accepted from the client
| - status is NEVER changed here
| - ownership is checked
| - pending_review is checked
| - only changed story fields are written
| - story images are touched ONLY when storyImages is supplied
| - story + images + activity use ONE database transaction
| - if the transaction fails, the database changes are rolled back
| - newly uploaded Cloudinary assets are cleaned up on transaction failure
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  /*
  |--------------------------------------------------------------------------
  | Keep track of newly supplied Cloudinary assets.
  |
  | If the database transaction fails, these are the assets that may need
  | to be removed from Cloudinary because the database never committed them.
  |--------------------------------------------------------------------------
  */

  const newlyUploadedPublicIds: string[] = [];

  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Authenticate
    |--------------------------------------------------------------------------
    */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Your session has expired. Please log in again before saving your changes.",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Get story ID
    |--------------------------------------------------------------------------
    */

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "We couldn't identify the story you are trying to save.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Read request body
    |--------------------------------------------------------------------------
    */

    let body: unknown;

    try {
      body = await request.json();
    } catch (error) {
      console.error(
        "Invalid pending review story request body:",
        error
      );

      return NextResponse.json(
        {
          message:
            "We couldn't read your changes. Please refresh the page and try again.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          message:
            "The information sent for this story is invalid. Please refresh the page and try again.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      title,
      content,
      category,
      coverImageUrl,
      coverImagePublicId,
      storyImages: uploadedImages,
    } = body as {
      title?: unknown;
      content?: unknown;
      category?: unknown;
      coverImageUrl?: unknown;
      coverImagePublicId?: unknown;
      storyImages?: unknown;
    };

    /*
    |--------------------------------------------------------------------------
    | 4. Validate required fields
    |--------------------------------------------------------------------------
    */

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Please enter a title for your story.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Please add some content to your story before saving.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof category !== "string" ||
      !category.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Please select a category for your story.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Validate cover image values
    |--------------------------------------------------------------------------
    */

    if (
      coverImageUrl !== undefined &&
      coverImageUrl !== null &&
      typeof coverImageUrl !== "string"
    ) {
      return NextResponse.json(
        {
          message:
            "The cover image URL is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      coverImagePublicId !== undefined &&
      coverImagePublicId !== null &&
      typeof coverImagePublicId !== "string"
    ) {
      return NextResponse.json(
        {
          message:
            "The cover image identifier is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Validate storyImages only when supplied
    |--------------------------------------------------------------------------
    */

    if (
      uploadedImages !== undefined &&
      !Array.isArray(uploadedImages)
    ) {
      return NextResponse.json(
        {
          message:
            "The additional story images could not be processed. Please refresh the page and try again.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Array.isArray(uploadedImages)
    ) {
      for (
        const image of uploadedImages
      ) {
        if (
          typeof image !== "object" ||
          image === null
        ) {
          return NextResponse.json(
            {
              message:
                "One of the story images is invalid. Please remove it and add the image again.",
            },
            {
              status: 400,
            }
          );
        }

        const typedImage =
          image as {
            url?: unknown;
            publicId?: unknown;
            caption?: unknown;
          };

        if (
          typeof typedImage.url !== "string" ||
          !typedImage.url.trim() ||
          typeof typedImage.publicId !== "string" ||
          !typedImage.publicId.trim()
        ) {
          return NextResponse.json(
            {
              message:
                "One of the story images is invalid. Please remove it and add the image again.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          typedImage.caption !== undefined &&
          typedImage.caption !== null &&
          typeof typedImage.caption !== "string"
        ) {
          return NextResponse.json(
            {
              message:
                "One of the story image captions is invalid.",
            },
            {
              status: 400,
            }
          );
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Find the story securely
    |--------------------------------------------------------------------------
    */

    const existingStory =
      await db.query.stories.findFirst({
        where: (
          stories,
          { eq, and }
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
              "pending_review"
            ),
            eq(
              stories.isDeleted,
              false
            )
          ),
      });

    if (!existingStory) {
      return NextResponse.json(
        {
          message:
            "This story cannot be edited because it was not found or is no longer awaiting review.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 8. Load existing story images
    |--------------------------------------------------------------------------
    |
    | This lets us identify which Cloudinary public IDs already belong to
    | the story and which ones are newly uploaded.
    |--------------------------------------------------------------------------
    */

    const existingImages =
      await db
        .select({
          id: storyImages.id,
          publicId:
            storyImages.publicId,
          imageUrl:
            storyImages.imageUrl,
          caption:
            storyImages.caption,
          displayOrder:
            storyImages.displayOrder,
        })
        .from(storyImages)
        .where(
          eq(
            storyImages.storyId,
            id
          )
        )
        .orderBy(
          storyImages.displayOrder
        );

    /*
    |--------------------------------------------------------------------------
    | 9. Find category
    |--------------------------------------------------------------------------
    */

    const cleanTitle =
      title.trim();

    const cleanContent =
      content.trim();

    const categoryName =
      category.trim();

    const existingCategory =
      await db.query.categories.findFirst({
        where: (
          categories,
          { eq }
        ) =>
          eq(
            categories.name,
            categoryName
          ),
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          message:
            "The selected category is no longer available. Please select another category and try again.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 10. Determine what changed
    |--------------------------------------------------------------------------
    */

    const titleChanged =
      cleanTitle !==
      existingStory.title;

    const contentChanged =
      cleanContent !==
      existingStory.content;

    const categoryChanged =
      existingCategory.id !==
      existingStory.categoryId;

    const finalCoverImage =
      coverImageUrl !== undefined
        ? coverImageUrl
        : existingStory.coverImage;

    const finalCoverImagePublicId =
      coverImagePublicId !== undefined
        ? coverImagePublicId
        : existingStory.coverImagePublicId;

    const coverChanged =
      finalCoverImage !==
        existingStory.coverImage ||
      finalCoverImagePublicId !==
        existingStory.coverImagePublicId;

    /*
    |--------------------------------------------------------------------------
    | storyImages is considered changed ONLY when the client explicitly
    | supplies the property.
    |--------------------------------------------------------------------------
    */

    const imagesWereSupplied =
      Array.isArray(
        uploadedImages
      );

    /*
    |--------------------------------------------------------------------------
    | 11. Identify newly uploaded Cloudinary assets
    |--------------------------------------------------------------------------
    */

    if (
      Array.isArray(uploadedImages)
    ) {
      const existingPublicIds =
        new Set(
          existingImages.map(
            (image) =>
              image.publicId
          )
        );

      for (
        const image of uploadedImages
      ) {
        const typedImage =
          image as UploadedStoryImage;

        if (
          !existingPublicIds.has(
            typedImage.publicId
          )
        ) {
          newlyUploadedPublicIds.push(
            typedImage.publicId
          );
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Cover image newly uploaded?
    |--------------------------------------------------------------------------
    */

    if (
      typeof finalCoverImagePublicId ===
        "string" &&
      finalCoverImagePublicId &&
      finalCoverImagePublicId !==
        existingStory.coverImagePublicId
    ) {
      newlyUploadedPublicIds.push(
        finalCoverImagePublicId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 12. Determine whether anything changed
    |--------------------------------------------------------------------------
    */

    const storyFieldsChanged =
      titleChanged ||
      contentChanged ||
      categoryChanged ||
      coverChanged;

    if (
      !storyFieldsChanged &&
      !imagesWereSupplied
    ) {
      return NextResponse.json(
        {
          message:
            "There were no changes to save.",

          story: {
            ...existingStory,
            images:
              existingImages,
          },
        },
        {
          status: 200,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 13. Generate excerpt only when content changed
    |--------------------------------------------------------------------------
    */

    const excerpt =
      contentChanged
        ? generateExcerpt(
            cleanContent
          )
        : existingStory.excerpt;

    /*
    |--------------------------------------------------------------------------
    | 14. Generate slug only when title changed
    |--------------------------------------------------------------------------
    */

    let slug =
      existingStory.slug;

    if (titleChanged) {
      const baseSlug =
        createSlug(
          cleanTitle
        );

      if (!baseSlug) {
        return NextResponse.json(
          {
            message:
              "Your story title contains no usable characters. Please choose a different title.",
          },
          {
            status: 400,
          }
        );
      }

      slug = baseSlug;

      let counter = 1;

      while (true) {
        const existingSlug =
          await db.query.stories.findFirst({
            where: (
              stories,
              { eq }
            ) =>
              eq(
                stories.slug,
                slug
              ),
          });

        if (
          !existingSlug ||
          existingSlug.id === id
        ) {
          break;
        }

        slug =
          `${baseSlug}-${counter}`;

        counter++;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 15. DATABASE TRANSACTION
    |--------------------------------------------------------------------------
    |
    | The story update, story image replacement and activity record all
    | happen inside the SAME transaction.
    |
    | If anything fails:
    |
    | - story changes roll back
    | - image changes roll back
    | - activity record rolls back
    |
    | The API then returns an error.
    |
    | Therefore we NEVER report a successful database save when the
    | transaction failed.
    |--------------------------------------------------------------------------
    */

    try {
      const transactionResult =
        await db.transaction(
          async (tx) => {
            /*
            |--------------------------------------------------------------------------
            | Re-check story inside transaction.
            |--------------------------------------------------------------------------
            */

            const currentStory =
              await tx.query.stories.findFirst({
        
