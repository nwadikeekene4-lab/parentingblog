import { NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";


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



    const drafts =
      await db
        .select({

          id: stories.id,

          title: stories.title,

          excerpt: stories.excerpt,

          content: stories.content,

          coverImage:
            stories.coverImage,

          createdAt:
            stories.createdAt,

          updatedAt:
            stories.updatedAt,

          category:
            categories.name,

        })

        .from(stories)


        .leftJoin(
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
              "draft"
            ),


            eq(
              stories.isDeleted,
              false
            )

          )
        )


        .orderBy(
          desc(
            stories.updatedAt
          )
        );



    return NextResponse.json(
      {
        drafts,
      },
      {
        status: 200,
      }
    );


  } catch (error) {


    console.error(
      "Fetch drafts error:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to fetch drafts.",
      },
      {
        status: 500,
      }
    );

  }

}
