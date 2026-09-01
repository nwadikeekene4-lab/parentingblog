import { NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
  storyLikes,
  comments,
  storyBookmarks,
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
| Fetch the currently logged-in user's published stories.
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const user = await getCurrentUser();

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
    | Fetch published stories
    |--------------------------------------------------------------------------
    */

    const publishedStories = await db
      .select({
        id: stories.id,

        title: stories.title,

        slug: stories.slug,

        coverImage: stories.coverImage,

        publishedAt: stories.publishedAt,

        createdAt: stories.createdAt,

        updatedAt: stories.updatedAt,

        category: categories.name,

        featured: stories.featured,

        views: stories.views,

        likes: sql<number>`
          (
            SELECT COUNT(*)
            FROM ${storyLikes}
            WHERE ${storyLikes.storyId} = ${stories.id}
          )
        `,

        comments: sql<number>`
          (
            SELECT COUNT(*)
            FROM ${comments}
            WHERE
              ${comments.storyId} = ${stories.id}
              AND ${comments.isDeleted} = false
              AND ${comments.isApproved} = true
          )
        `,

        bookmarks: sql<number>`
          (
            SELECT COUNT(*)
            FROM ${storyBookmarks}
            WHERE ${storyBookmarks.storyId} = ${stories.id}
          )
        `,
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
          eq(
            stories.authorId,
            user.id
          ),
          eq(
            stories.status,
            "published"
          ),
          eq(
            stories.isDeleted,
            false
          )
        )
      )
      .orderBy(
        desc(
          stories.publishedAt
        )
      );

    /*
    |--------------------------------------------------------------------------
    | No published stories
    |--------------------------------------------------------------------------
    */

    if (publishedStories.length === 0) {
      return NextResponse.json(
        {
          stories: [],
        },
        {
          status: 200,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Get story IDs
    |--------------------------------------------------------------------------
    */

    const storyIds = publishedStories.map(
      (story) => story.id
    );

    /*
    |--------------------------------------------------------------------------
    | Fetch all additional images in one query
    |--------------------------------------------------------------------------
    */

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
        inArray(
          storyImages.storyId,
          storyIds
        )
      )
      .orderBy(
        storyImages.displayOrder
      );

    /*
    |--------------------------------------------------------------------------
    | Group images by story
    |--------------------------------------------------------------------------
    */

    const imagesByStory =
      new Map<
        string,
        typeof additionalImages
      >();

    for (const image of additionalImages) {
      const existing =
        imagesByStory.get(
          image.storyId
        ) ?? [];

      existing.push(image);

      imagesByStory.set(
        image.storyId,
        existing
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Build response
    |--------------------------------------------------------------------------
    */

    const formattedStories =
      publishedStories.map(
        (story) => ({
          id: story.id,

          title: story.title,

          slug: story.slug,

          coverImage:
            story.coverImage,

          publishedAt:
            story.publishedAt,

          createdAt:
            story.createdAt,

          updatedAt:
            story.updatedAt,

          category:
            story.category,

          featured:
            story.featured,

          views:
            Number(
              story.views ?? 0
            ),

          likes:
            Number(
              story.likes ?? 0
            ),

          comments:
            Number(
              story.comments ?? 0
            ),

          bookmarks:
            Number(
              story.bookmarks ?? 0
            ),

          images:
            imagesByStory.get(
              story.id
            ) ?? [],
        })
      );

    return NextResponse.json(
      {
        stories:
          formattedStories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Fetch published stories error:",
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
| POST
|--------------------------------------------------------------------------
| Create a new story or draft.
|
| User request:
|
| draft     -> draft
| published -> pending_review
|
| A normal user cannot directly publish a story.
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Unauthorized.",
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
          message:
            "Invalid request.",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    /*
    |--------------------------------------------------------------------------
    | Read fields
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
    | Validate story images
    |--------------------------------------------------------------------------
    */

    const uploadedImages = Array.isArray(
      data.storyImages
    )
      ? data.storyImages
          .filter(
            (
              image
            ): image is {
              url: string;
              publicId: string;
            } =>
              Boolean(
                image &&
                  typeof image ===
                    "object" &&
                  typeof (
                    image as Record<
                      string,
                      unknown
                    >
                  ).url === "string" &&
                  typeof (
                    image as Record<
                      string,
                      unknown
                    >
                  ).publicId ===
                    "string"
              )
          )
          .slice(0, 20)
          .map((image) => ({
            url: image.url.trim(),
            publicId:
              image.publicId.trim(),
          }))
          .filter(
            (image) =>
              image.url.length > 0 &&
              image.publicId.length > 0
          )
      )
      : [];

    /*
    |--------------------------------------------------------------------------
    | Validate required fields
    |--------------------------------------------------------------------------
    */

    if (!title) {
      return NextResponse.json(
        {
          message:
            "Please enter a story title.",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          message:
            "Please write your story.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          message:
            "Please select a category.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
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
    | Find active category
    |--------------------------------------------------------------------------
    */

    const existingCategory =
      await db.query.categories.findFirst({
        where: (
          categoryRecord,
          { and, eq }
        ) =>
          and(
            eq(
              categoryRecord.name,
              category
            ),
            eq(
              categoryRecord.isActive,
              true
            )
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
    | Generate unique slug
    |--------------------------------------------------------------------------
    */

    const baseSlug =
      createSlug(title);

    let slug =
      baseSlug || `story-${Date.now()}`;

    let counter = 1;

    while (true) {
      const existingStory =
        await db.query.stories.findFirst({
          where: (
            story,
            { eq }
          ) =>
            eq(
              story.slug,
              slug
            ),
        });

      if (!existingStory) {
        break;
      }

      slug =
        `${baseSlug || "story"}-${counter}`;

      counter++;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate excerpt
    |--------------------------------------------------------------------------
    */

    const excerpt =
      generateExcerpt(
        content
      );

    /*
    |--------------------------------------------------------------------------
    | Determine database status
    |--------------------------------------------------------------------------
    |
    | draft     -> draft
    | published -> pending_review
    |--------------------------------------------------------------------------
    */

    const databaseStatus =
      status === "published"
        ? "pending_review"
        : "draft";

    /*
    |--------------------------------------------------------------------------
    | New story submission type
    |--------------------------------------------------------------------------
    */

    const submissionType =
      "new_submission" as const;

    /*
    |--------------------------------------------------------------------------
    | A pending story is not published yet.
    |--------------------------------------------------------------------------
    */

    const publishedAt = null;

    /*
    |--------------------------------------------------------------------------
    | Create story
    |--------------------------------------------------------------------------
    */

    const [story] =
      await db
        .insert(stories)
        .values({
          title,

          slug,

          excerpt,

          content,

          coverImage:
            coverImageUrl,

          coverImagePublicId:
            coverImagePublicId,

          authorId:
            user.id,

          categoryId:
            existingCategory.id,

          status:
            databaseStatus,

          submissionType,

          featured:
            false,

          publishedAt,
        })
        .returning();

    /*
    |--------------------------------------------------------------------------
    | Save additional images
    |--------------------------------------------------------------------------
    */

    if (
      uploadedImages.length > 0
    ) {
      await db
        .insert(storyImages)
        .values(
          uploadedImages.map(
            (
              image,
              index
            ) => ({
              storyId:
                story.id,

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
    | Activity logging
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Activity logging is secondary.
    |
    | If activity creation fails, the story has already
    | been successfully saved. We therefore DO NOT return
    | HTTP 500 because of an activity failure.
    |--------------------------------------------------------------------------
    */

    try {
      if (
        status === "published"
      ) {
        await createActivity({
          userId:
            user.id,

          type:
            "story_submitted",

          message:
            `You submitted "${story.title}" for review.`,

          storyId:
            story.id,
        });
      } else {
        await createActivity({
          userId:
            user.id,

          type:
            "story_draft_saved",

          message:
            `You saved "${story.title}" as a draft.`,

          storyId:
            story.id,
        });
      }
    } catch (activityError) {
      /*
      |--------------------------------------------------------------------------
      | DO NOT fail the story operation.
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
          status === "published"
            ? "Story submitted for review successfully."
            : "Draft saved successfully.",

        story,

        status:
          databaseStatus,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create story error:",
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
