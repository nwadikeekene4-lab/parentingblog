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
| - status is NOT accepted from the client
| - status is NOT modified
| - ownership is checked
| - pending_review is checked
| - activity logging cannot make a successful save fail
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
    /*
    |--------------------------------------------------------------------------
    | 1. Authenticate user
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
    | 3. Read request body safely
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
    | 5. Find the story securely
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
    | 6. Find category
    |--------------------------------------------------------------------------
    */

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
    | 7. Generate excerpt
    |--------------------------------------------------------------------------
    */

    const cleanTitle =
      title.trim();

    const cleanContent =
      content.trim();

    const excerpt =
      generateExcerpt(
        cleanContent
      );

    /*
    |--------------------------------------------------------------------------
    | 8. Generate / preserve slug
    |--------------------------------------------------------------------------
    */

    let slug =
      existingStory.slug;

    if (
      cleanTitle !==
      existingStory.title
    ) {
      const baseSlug =
        createSlug(
          cleanTitle
        );

      /*
      |--------------------------------------------------------------------------
      | Prevent an empty slug.
      |--------------------------------------------------------------------------
      */

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
    | 9. Prepare image values
    |--------------------------------------------------------------------------
    */

    const finalCoverImage =
      typeof coverImageUrl ===
      "string"
        ? coverImageUrl
        : coverImageUrl === null
        ? null
        : existingStory.coverImage;

    const finalCoverImagePublicId =
      typeof coverImagePublicId ===
      "string"
        ? coverImagePublicId
        : coverImagePublicId === null
        ? null
        : existingStory.coverImagePublicId;

    /*
    |--------------------------------------------------------------------------
    | 10. Validate story images if supplied
    |--------------------------------------------------------------------------
    */

    if (
      uploadedImages !== undefined &&
      !Array.isArray(
        uploadedImages
      )
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
      Array.isArray(
        uploadedImages
      )
    ) {
      for (
        const image of uploadedImages
      ) {
        if (
          typeof image !==
            "object" ||
          image === null ||
          typeof (
            image as {
              url?: unknown;
            }
          ).url !== "string" ||
          typeof (
            image as {
              publicId?: unknown;
            }
          ).publicId !== "string"
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
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 11. Update the main story
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | There is intentionally NO "status" field.
    |
    | pending_review remains pending_review.
    |--------------------------------------------------------------------------
    */

    let updatedStory;

    try {
      const result =
        await db
          .update(stories)
          .set({
            title:
              cleanTitle,

            slug,

            excerpt,

            content:
              cleanContent,

            coverImage:
              finalCoverImage,

            coverImagePublicId:
              finalCoverImagePublicId,

            categoryId:
              existingCategory.id,

            updatedAt:
              new Date(),
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

      updatedStory =
        result[0];
    } catch (error) {
      console.error(
        "Database error while updating pending review story:",
        error
      );

      const databaseError =
        getErrorMessage(
          error
        );

      /*
      |--------------------------------------------------------------------------
      | Unique slug conflict
      |--------------------------------------------------------------------------
      */

      if (
        databaseError
          .toLowerCase()
          .includes("unique")
      ) {
        return NextResponse.json(
          {
            message:
              "We couldn't save this title because it conflicts with another story. Please choose a slightly different title and try again.",
          },
          {
            status: 409,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | General database failure
      |--------------------------------------------------------------------------
      */

      return NextResponse.json(
        {
          message:
            "We couldn't save your story changes right now. Your original story has not been intentionally changed. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    if (!updatedStory) {
      return NextResponse.json(
        {
          message:
            "Your story could not be updated because it may have been changed or removed. Please refresh the page and try again.",
        },
        {
          status: 409,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 12. Update additional images ONLY if supplied
    |--------------------------------------------------------------------------
    */

    if (
      Array.isArray(
        uploadedImages
      )
    ) {
      try {
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
            .insert(
              storyImages
            )
            .values(
              uploadedImages.map(
                (
                  image,
                  index
                ) => {
                  const typedImage =
                    image as {
                      url: string;
                      publicId: string;
                      caption?: string | null;
                    };

                  return {
                    storyId:
                      id,

                    imageUrl:
                      typedImage.url,

                    publicId:
                      typedImage.publicId,

                    caption:
                      typedImage.caption ??
                      null,

                    displayOrder:
                      index,
                  };
                }
              )
            );
        }
      } catch (error) {
        console.error(
          "Database error while updating pending review story images:",
          error
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        |
        | The main story has already been successfully saved.
        |
        | Do NOT tell the user "Internal server error".
        |--------------------------------------------------------------------------
        */

        return NextResponse.json(
          {
            message:
              "Your story details were saved, but we couldn't finish updating its additional images. Please open the story again and save the images once more.",
            story:
              updatedStory,
          },
          {
            status: 207,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 13. Record activity
    |--------------------------------------------------------------------------
    |
    | Activity logging is secondary.
    |
    | A failure here MUST NOT cause a successful story save
    | to be reported as a failure.
    |--------------------------------------------------------------------------
    */

    try {
      await createActivity({
        userId:
          user.id,

        type:
          "story_edited",

        message:
          `You edited "${updatedStory.title}" while it was awaiting review.`,

        storyId:
          updatedStory.id,
      });
    } catch (error) {
      console.error(
        "Story saved but activity logging failed:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | Do not throw.
      |
      | The story was already saved successfully.
      |--------------------------------------------------------------------------
      */
    }

    /*
    |--------------------------------------------------------------------------
    | 14. Return successful response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Your changes were saved successfully. Your story is still awaiting administrator review.",

        story:
          updatedStory,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
   
