import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { generateExcerpt } from "@/lib/story";


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

    const user =
      await getCurrentUser();


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


    const publishedStories =
      await db
        .select({
          id: stories.id,

          title: stories.title,

          slug: stories.slug,

          coverImage:
            stories.coverImage,

          publishedAt:
            stories.publishedAt,

          createdAt:
            stories.createdAt,

          updatedAt:
            stories.updatedAt,

          category:
            categories.name,
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


    return NextResponse.json(
      {
        stories:
          publishedStories,
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
          message: "Unauthorized",
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


    const excerpt =
      generateExcerpt(content);


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
            status === "published"
              ? "pending_review"
              : "draft",

          publishedAt:
            status === "published"
              ? new Date()
              : null,

        })
        .returning();


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
