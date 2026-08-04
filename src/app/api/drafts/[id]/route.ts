import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";


export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } = await params;


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


    const draft =
      await db.query.stories.findFirst({

        where: (stories, { and, eq }) =>
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
              "draft"
            )
          ),

        with: {

          category: true,

          images: true,

        },

      });



    if (!draft) {

      return NextResponse.json(
        {
          message:
            "Draft not found.",
        },
        {
          status: 404,
        }
      );

    }



    return NextResponse.json(
      {
        draft,
      },
      {
        status: 200,
      }
    );


  } catch (error) {


    console.error(
      "Fetch draft error:",
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


export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await params;

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

const existingCategory =
  await db.query.categories.findFirst({

    where: (categories, { eq }) =>
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

const existingDraft =
  await db.query.stories.findFirst({

    where: (stories, { and, eq }) =>
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
          "draft"
        ),

      ),

  });

if (!existingDraft) {

  return NextResponse.json(
    {
      message:
        "Draft not found.",
    },
    {
      status: 404,
    }
  );

}
    await db
  .update(stories)
  .set({

    title: title.trim(),

    content: content.trim(),

    excerpt:
      content
        .trim()
        .split(/\s+/)
        .slice(0, 40)
        .join(" "),

    categoryId:
      existingCategory.id,

    coverImage:
      coverImageUrl ?? null,

    coverImagePublicId:
      coverImagePublicId ?? null,

    status:
      status === "published"
        ? "pending_review"
        : "draft",

    publishedAt:
      status === "published"
        ? new Date()
        : null,

    updatedAt:
      new Date(),

  })

  .where(
    eq(
      stories.id,
      id
    )
  );



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
          },
          index: number
        ) => ({

          storyId: id,

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
        : "Draft updated successfully.",
  },
  {
    status: 200,
  }
);

} catch (error) {

  console.error(
    "Update draft error:",
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
