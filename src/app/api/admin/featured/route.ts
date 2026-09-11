import { NextResponse } from "next/server";
import {
  and,
  desc,
  eq,
  ilike,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
*/

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: "Forbidden.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Returns:
|
| 1. Currently featured published stories
| 2. Published non-featured stories
|
| Search applies to ALL published, non-deleted stories.
|--------------------------------------------------------------------------
*/

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ?? "";

    const baseConditions = [
      eq(stories.status, "published"),
      eq(stories.isDeleted, false),
    ];

    const searchCondition = search
      ? or(
          ilike(stories.title, `%${search}%`),
          ilike(
            categories.name,
            `%${search}%`
          ),
          ilike(
            users.displayName,
            `%${search}%`
          )
        )
      : undefined;

    const availableConditions = searchCondition
      ? and(
          ...baseConditions,
          eq(stories.featured, false),
          searchCondition
        )
      : and(
          ...baseConditions,
          eq(stories.featured, false)
        );

    const featuredConditions = searchCondition
      ? and(
          ...baseConditions,
          eq(stories.featured, true),
          searchCondition
        )
      : and(
          ...baseConditions,
          eq(stories.featured, true)
        );

    /*
    |--------------------------------------------------------------------------
    | FEATURED STORIES
    |--------------------------------------------------------------------------
    */

    const featuredStories =
      await db
        .select({
          id: stories.id,
          title: stories.title,
          slug: stories.slug,
          coverImage:
            stories.coverImage,
          excerpt: stories.excerpt,
          category:
            categories.name,
          author:
            users.displayName,
          views: stories.views,
          publishedAt:
            stories.publishedAt,
          createdAt:
            stories.createdAt,
          featured:
            stories.featured,
        })
        .from(stories)
        .innerJoin(
          categories,
          eq(
            stories.categoryId,
            categories.id
          )
        )
        .innerJoin(
          users,
          eq(
            stories.authorId,
            users.id
          )
        )
        .where(
          featuredConditions
        )
        .orderBy(
          desc(stories.publishedAt),
          desc(stories.createdAt)
        );

    /*
    |--------------------------------------------------------------------------
    | AVAILABLE STORIES
    |--------------------------------------------------------------------------
    */

    const availableStories =
      await db
        .select({
          id: stories.id,
          title: stories.title,
          slug: stories.slug,
          coverImage:
            stories.coverImage,
          excerpt: stories.excerpt,
          category:
            categories.name,
          author:
            users.displayName,
          views: stories.views,
          publishedAt:
            stories.publishedAt,
          createdAt:
            stories.createdAt,
          featured:
            stories.featured,
        })
        .from(stories)
        .innerJoin(
          categories,
          eq(
            stories.categoryId,
            categories.id
          )
        )
        .innerJoin(
          users,
          eq(
            stories.authorId,
            users.id
          )
        )
        .where(
          availableConditions
        )
        .orderBy(
          desc(stories.publishedAt),
          desc(stories.createdAt)
        );

    return NextResponse.json(
      {
        featuredStories,
        availableStories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin featured stories GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load featured stories.",
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
| Feature or unfeature a published story.
|
| body:
| {
|   storyId: string,
|   featured: boolean
| }
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid request body.",
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
            "Invalid request body.",
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

    const storyId =
      typeof data.storyId === "string"
        ? data.storyId.trim()
        : "";

    const featured =
      typeof data.featured === "boolean"
        ? data.featured
        : null;

    if (!storyId) {
      return NextResponse.json(
        {
          message:
            "Story ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (featured === null) {
      return NextResponse.json(
        {
          message:
            "Featured value is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify the story
    |--------------------------------------------------------------------------
    |
    | Only published and non-deleted stories
    | can be featured.
    |
    */

    const story =
      await db.query.stories.findFirst({
        where: and(
          eq(stories.id, storyId),
          eq(
            stories.status,
            "published"
          ),
          eq(
            stories.isDeleted,
            false
          )
        ),
        columns: {
          id: true,
          featured: true,
        },
      });

    if (!story) {
      return NextResponse.json(
        {
          message:
            "Published story not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update featured state
    |--------------------------------------------------------------------------
    */

    await db
      .update(stories)
      .set({
        featured,
        updatedAt: new Date(),
      })
      .where(
        eq(stories.id, storyId)
      );

    return NextResponse.json(
      {
        message: featured
          ? "Story added to featured stories."
          : "Story removed from featured stories.",
        storyId,
        featured,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin featured stories POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update featured story.",
      },
      {
        status: 500,
      }
    );
  }
    }
