import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

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
            ),

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

    if (
      !draft.title ||
      !draft.content ||
      !draft.categoryId
    ) {

      return NextResponse.json(
        {
          message:
            "This draft is incomplete and cannot be published.",
        },
        {
          status: 400,
        }
      );

  }
        if (!draft.coverImage) {

      return NextResponse.json(
        {
          message:
            "Please add a cover image before publishing.",
        },
        {
          status: 400,
        }
      );

    }

    await db
      .update(stories)
      .set({

        status:
          "pending_review",

        publishedAt:
          new Date(),

        updatedAt:
          new Date(),

      })
      .where(
        eq(
          stories.id,
          id
        )
      );

    return NextResponse.json(
      {
        message:
          "Story submitted for review successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Publish draft error:",
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
