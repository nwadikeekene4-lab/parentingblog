import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { generateExcerpt } from "@/lib/story";
import { createActivity } from "@/lib/activity";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load ONE pending_review story belonging to the logged-in user.
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
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const story = await db
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

        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,

        authorId: stories.authorId,
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
        )
      )
      .limit(1);

    if (story.length === 0) {
      return NextResponse.json(
        {
          message:
            "Story not found or you are not allowed to edit it.",
        },
        {
          status: 404,
        }
      );
    }

    const additionalImages = await db
      .select({
        id: storyImages.id,
        storyId: storyImages.storyId,
        imageUrl: storyImages.imageUrl,
        publicId: storyImages.publicId,
        caption: storyImages.caption,
        displayOrder: storyImages.displayOrder,
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
          "Internal server error.",
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
| Update ONE pending_review story belonging to the logged-in user.
|
| IMPORTANT:
| The status is NEVER taken from the request body.
| The story remains pending_review after the update.
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
  try {
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

    const { id } = await context.params;

    const body = await request.json();

    const {
      title,
      content,
      category,
      coverImageUrl,
      coverImagePublicId,
      storyImages: uploadedImages = [],
    } = body;

    /*
    |--------------------------------------------------------------------------
    | 1. Validate required fields
    |--------------------------------------------------------------------------
    */

    if (
      !title ||
      !content ||
      !category
    ) {
      return NextResponse.json(
        {
          message:
            "Title, content and category are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Find the story securely
    |--------------------------------------------------------------------------
    |
    | We check:
    | - Story ID
    | - Current user owns it
    | - Story is pending_review
    | - Story is not deleted
    |
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
            "Story not found or you are not allowed to edit it.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Find category
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
    | 4. Generate excerpt
    |--------------------------------------------------------------------------
    */

    const excerpt =
      generateExcerpt(
        content.trim()
      );

    /*
    |--------------------------------------------------------------------------
    | 5. Generate slug
    |--------------------------------------------------------------------------
    |
    | We only generate a new slug if the title changed.
    |
    */

    let slug =
      existingStory.slug;

    if (
      title.trim() !==
      existingStory.title
    ) {
      slug =
        createSlug(
          title
        );

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
          `${createSlug(
            title
          )}-${counter}`;

        counter++;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Update story
    |--------------------------------------------------------------------------
    |
    | NOTICE:
    | There is NO status field here.
    |
    | Therefore the existing pending_review status is preserved.
    |--------------------------------------------------------------------------
    */

    const [updatedStory] =
      await db
        .update(stories)
        .set({
          title:
            title.trim(),

          slug,

          excerpt,

          content:
            content.trim(),

          coverImage:
            coverImageUrl ?? null,

          coverImagePublicId:
            coverImagePublicId ?? null,

          categoryId:
            existingCategory.id,

          updatedAt:
            new Date(),

          // DO NOT ADD status HERE.
          //
          // The existing status remains:
          // pending_review
        })
        .where(
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
          )
        )
        .returning();

    if (!updatedStory) {
      return NextResponse.json(
        {
          message:
            "Story could not be updated.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Replace additional story images
    |--------------------------------------------------------------------------
    |
    | Only do this when storyImages is actually supplied.
    |--------------------------------------------------------------------------
    */

    if (
      Array.isArray(
        uploadedImages
      )
    ) {
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
                  caption?: string | null;
                },
                index: number
              ) => ({
                storyId:
                  id,

                imageUrl:
                  image.url,

                publicId:
                  image.publicId,

                caption:
                  image.caption ??
                  null,

                displayOrder:
                  index,
              })
            )
          );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 8. Record activity
    |--------------------------------------------------------------------------
    */

    await createActivity({
      userId:
        user.id,

      type:
        "story_submitted",

      message:
        `You updated "${updatedStory.title}" while it was awaiting review.`,

      storyId:
        updatedStory.id,
    });

    /*
    |--------------------------------------------------------------------------
    | 9. Return updated story
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Story updated successfully and remains pending review.",

        story:
          updatedStory,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update pending review story error:",
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
