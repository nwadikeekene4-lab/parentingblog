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
|
| Includes:
| - Cover image
| - All additional story images
| - Views
| - Likes
| - Comments
| - Bookmarks
| - Featured status
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
    | 1. Fetch the user's published stories
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
    | 2. If there are no published stories
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
    | 3. Get all story IDs
    |--------------------------------------------------------------------------
    */

    const storyIds = publishedStories.map(
      (story) => story.id
    );

    /*
    |--------------------------------------------------------------------------
    | 4. Fetch ALL additional images
    |--------------------------------------------------------------------------
    |
    | These images are stored separately in story_images.
    | We fetch them in one query instead of querying the database
    | once for every story.
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
    | 5. Group images by story
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
    | 6. Build the final response
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

    /*
    |--------------------------------------------------------------------------
    | 7. Return response
    |--------------------------------------------------------------------------
    */

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
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
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
    | Validate requested status
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
    | Generate unique slug
    |--------------------------------------------------------------------------
    */

    let slug =
      createSlug(title);

    let counter = 1;

    while (true) {
      const existingStory =
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

      if (!existingStory) {
        break;
      }

      slug =
        `${createSlug(title)}-${counter}`;

      counter++;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate excerpt
    |--------------------------------------------------------------------------
    */

    const excerpt =
      generateExcerpt(content);

    /*
    |--------------------------------------------------------------------------
    | Determine actual database status
    |--------------------------------------------------------------------------
    |
    | User requests:
    |
    | draft     -> draft
    | published -> pending_review
    |
    | A normal registered user cannot publish directly.
    |--------------------------------------------------------------------------
    */

    const databaseStatus =
      status === "published"
        ? "pending_review"
        : "draft";

    /*
    |--------------------------------------------------------------------------
    | Determine submission type
    |--------------------------------------------------------------------------
    |
    | This is a brand-new story, so it is always:
    |
    | new_submission
    |--------------------------------------------------------------------------
    */

    const submissionType =
      "new_submission" as const;

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    |
    | publishedAt must ONLY be set when the story is actually published.
    |
    | A newly submitted story is still pending review, therefore:
    |
    | publishedAt = null
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
    | Save additional story images
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
              image: {
                url: string;
                publicId: string;
              },
              index: number
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
    | Record story activity
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Return response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          status === "published"
            ? "Story submitted for review successfully."
            : "Draft saved successfully.",

        story,
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
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
             }
