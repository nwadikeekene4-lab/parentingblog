import { NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";

import {
  storyBookmarks,
  stories,
  users,
  categories,
  storyImages,
  storyLikes,
  comments,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";


/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Fetch all published stories bookmarked by the currently logged-in user.
|
| Includes:
|
| - Original story information
| - Author information
| - Category
| - Cover image
| - All additional story images
| - Views
| - Likes
| - Comments
| - Featured status
| - Date the user bookmarked the story
|--------------------------------------------------------------------------
*/

export async function GET() {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Get current user
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | 2. Fetch user's bookmarks
    |--------------------------------------------------------------------------
    */

    const bookmarkedStories =
      await db
        .select({

          /*
          |--------------------------------------------------------------------------
          | Bookmark information
          |--------------------------------------------------------------------------
          */

          bookmarkId:
            storyBookmarks.id,

          bookmarkedAt:
            storyBookmarks.createdAt,


          /*
          |--------------------------------------------------------------------------
          | Story information
          |--------------------------------------------------------------------------
          */

          id:
            stories.id,

          title:
            stories.title,

          slug:
            stories.slug,

          content:
            stories.content,

          coverImage:
            stories.coverImage,

          coverImagePublicId:
            stories.coverImagePublicId,

          featured:
            stories.featured,

          views:
            stories.views,

          publishedAt:
            stories.publishedAt,

          createdAt:
            stories.createdAt,

          updatedAt:
            stories.updatedAt,


          /*
          |--------------------------------------------------------------------------
          | Author information
          |--------------------------------------------------------------------------
          */

          authorId:
            users.id,

          authorName:
            users.displayName,

          authorProfileImage:
            users.profileImage,

          authorBio:
            users.bio,


          /*
          |--------------------------------------------------------------------------
          | Category information
          |--------------------------------------------------------------------------
          */

          categoryId:
            categories.id,

          category:
            categories.name,

          categorySlug:
            categories.slug,


          /*
          |--------------------------------------------------------------------------
          | Current likes
          |--------------------------------------------------------------------------
          */

          likes:
            sql<number>`
              (
                SELECT COUNT(*)
                FROM ${storyLikes}
                WHERE
                  ${storyLikes.storyId}
                  = ${stories.id}
              )
            `,


          /*
          |--------------------------------------------------------------------------
          | Current comments
          |--------------------------------------------------------------------------
          |
          | Only approved and non-deleted comments
          | are counted.
          |--------------------------------------------------------------------------
          */

          comments:
            sql<number>`
              (
                SELECT COUNT(*)
                FROM ${comments}
                WHERE
                  ${comments.storyId}
                  = ${stories.id}

                  AND
                  ${comments.isApproved}
                  = true

                  AND
                  ${comments.isDeleted}
                  = false
              )
            `,


          /*
          |--------------------------------------------------------------------------
          | Current bookmark count
          |--------------------------------------------------------------------------
          */

          bookmarkCount:
            sql<number>`
              (
                SELECT COUNT(*)
                FROM ${storyBookmarks}
                WHERE
                  ${storyBookmarks.storyId}
                  = ${stories.id}
              )
            `,

        })

        .from(storyBookmarks)


        /*
        |--------------------------------------------------------------------------
        | Join the original story
        |--------------------------------------------------------------------------
        */

        .innerJoin(
          stories,
          eq(
            storyBookmarks.storyId,
            stories.id
          )
        )


        /*
        |--------------------------------------------------------------------------
        | Join the story author
        |--------------------------------------------------------------------------
        */

        .innerJoin(
          users,
          eq(
            stories.authorId,
            users.id
          )
        )


        /*
        |--------------------------------------------------------------------------
        | Join category
        |--------------------------------------------------------------------------
        */

        .innerJoin(
          categories,
          eq(
            stories.categoryId,
            categories.id
          )
        )


        /*
        |--------------------------------------------------------------------------
        | Only this user's bookmarks
        |
        | Only published and non-deleted stories.
        |--------------------------------------------------------------------------
        */

        .where(
          and(

            eq(
              storyBookmarks.userId,
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


        /*
        |--------------------------------------------------------------------------
        | Most recently bookmarked first
        |--------------------------------------------------------------------------
        */

        .orderBy(
          desc(
            storyBookmarks.createdAt
          )
        );


    /*
    |--------------------------------------------------------------------------
    | 3. No bookmarks
    |--------------------------------------------------------------------------
    */

    if (
      bookmarkedStories.length === 0
    ) {

      return NextResponse.json(
        {
          bookmarks: [],
        },
        {
          status: 200,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 4. Get story IDs
    |--------------------------------------------------------------------------
    */

    const storyIds =
      bookmarkedStories.map(
        (story) =>
          story.id
      );


    /*
    |--------------------------------------------------------------------------
    | 5. Fetch all additional story images
    |--------------------------------------------------------------------------
    */

    const additionalImages =
      await db
        .select({

          id:
            storyImages.id,

          storyId:
            storyImages.storyId,

          imageUrl:
            storyImages.imageUrl,

          publicId:
            storyImages.publicId,

          caption:
            storyImages.caption,

          displayOrder:
            storyImages.displayOrder,

          createdAt:
            storyImages.createdAt,

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
    | 6. Group images by story
    |--------------------------------------------------------------------------
    */

    const imagesByStory =
      new Map<
        string,
        typeof additionalImages
      >();


    for (
      const image of additionalImages
    ) {

      const existingImages =
        imagesByStory.get(
          image.storyId
        ) ?? [];


      existingImages.push(
        image
      );


      imagesByStory.set(
        image.storyId,
        existingImages
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 7. Build final response
    |--------------------------------------------------------------------------
    */

    const formattedBookmarks =
      bookmarkedStories.map(
        (story) => ({

          /*
          |--------------------------------------------------------------------------
          | Bookmark information
          |--------------------------------------------------------------------------
          */

          bookmarkId:
            story.bookmarkId,

          bookmarkedAt:
            story.bookmarkedAt,


          /*
          |--------------------------------------------------------------------------
          | Original story
          |--------------------------------------------------------------------------
          */

          story: {

            id:
              story.id,

            title:
              story.title,

            slug:
              story.slug,

            content:
              story.content,

            coverImage:
              story.coverImage,

            coverImagePublicId:
              story.coverImagePublicId,

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

            bookmarkCount:
              Number(
                story.bookmarkCount ?? 0
              ),

            publishedAt:
              story.publishedAt,

            createdAt:
              story.createdAt,

            updatedAt:
              story.updatedAt,


            /*
            |--------------------------------------------------------------------------
            | Author
            |--------------------------------------------------------------------------
            */

            author: {

              id:
                story.authorId,

              displayName:
                story.authorName,

              profileImage:
                story.authorProfileImage,

              bio:
                story.authorBio,

            },


            /*
            |--------------------------------------------------------------------------
            | Category
            |--------------------------------------------------------------------------
            */

            category: {

              id:
                story.categoryId,

              name:
                story.category,

              slug:
                story.categorySlug,

            },


            /*
            |--------------------------------------------------------------------------
            | Additional images
            |--------------------------------------------------------------------------
            */

            images:
              imagesByStory.get(
                story.id
              ) ?? [],

          },

        })
      );


    /*
    |--------------------------------------------------------------------------
    | 8. Return response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        bookmarks:
          formattedBookmarks,
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "Fetch bookmarks error:",
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
