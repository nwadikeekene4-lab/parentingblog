import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

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
    params: {
      id: string;
    };
  }
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


    const draft =
      await db.query.stories.findFirst({

        where: (stories, { and, eq }) =>
          and(
            eq(
              stories.id,
              params.id
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
