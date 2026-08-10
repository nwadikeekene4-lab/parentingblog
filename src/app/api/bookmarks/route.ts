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
| Fetch all published stories bookmarked by the current user.
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


    const bookmarkedStories =
      await db
        .select({

          bookmarkId:
            storyBookmarks.id,

          bookmarkedAt:
            storyBookmarks.createdAt,


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


          authorId:
            users.id,

          authorName:
            users.displayName,

          authorProfileImage:
            users.profileImage,

          authorBio:
            users.bio,


          categoryId:
            categories.id,

          category:
            categories.name,

          categorySlug:
            categories.slug,


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


          comments:
            sql<number>`
              (
                SELECT COUNT(*)
                FROM ${comments}
                WHERE
                  ${comments.storyId}
                  = ${stories.id}
                  AND ${comments.isApproved} = true
                  AND ${comments.isDeleted} = false
              )
            `,


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

        .innerJoin(
          stories,
          eq(
            storyBookmarks.storyId,
            stories.id
          )
        )

        .innerJoin(
          users,
          eq(
            stories.authorId,
            users.id
          )
        )

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

        .orderBy(
          desc(
            storyBookmarks.createdAt
          )
        );


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


    const storyIds =
      bookmarkedStories.map(
        (story) =>
          story.id
      );


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


    const formattedBookmarks =
      bookmarkedStories.map(
        (story) => ({

          bookmarkId:
            story.bookmarkId,

          bookmarkedAt:
            story.bookmarkedAt,


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


            category: {

              id:
                story.categoryId,

              name:
                story.category,

              slug:
                story.categorySlug,

            },


            images:
              imagesByStory.get(
                story.id
              ) ?? [],

          },

        })
      );


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


/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Add a story to the current user's bookmarks.
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


    const storyId =
      body.storyId;


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


    /*
    |--------------------------------------------------------------------------
    | Check that the story exists and is published.
    |--------------------------------------------------------------------------
    */

    const story =
      await db.query.stories.findFirst({

        where: and(

          eq(
            stories.id,
            storyId
          ),

          eq(
            stories.status,
            "published"
          ),

          eq(
            stories.isDeleted,
            false
          )

        ),

      });


    if (!story) {

      return NextResponse.json(
        {
          message:
            "Story not found.",
        },
        {
          status: 404,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate bookmarks.
    |--------------------------------------------------------------------------
    */

    const existingBookmark =
      await db
        .select({
          id:
            storyBookmarks.id,
        })

        .from(storyBookmarks)

        .where(
          and(

            eq(
              storyBookmarks.storyId,
              storyId
            ),

            eq(
              storyBookmarks.userId,
              user.id
            )

          )
        )

        .limit(1);


    if (
      existingBookmark.length > 0
    ) {

      return NextResponse.json(
        {
          message:
            "Story is already bookmarked.",
        },
        {
          status: 200,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Create bookmark.
    |--------------------------------------------------------------------------
    */

    const [bookmark] =
      await db
        .insert(storyBookmarks)
        .values({

          storyId,

          userId:
            user.id,

        })

        .returning({

          id:
            storyBookmarks.id,

          storyId:
            storyBookmarks.storyId,

          createdAt:
            storyBookmarks.createdAt,

        });


    return NextResponse.json(
      {
        message:
          "Story bookmarked successfully.",

        bookmark,

      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Create bookmark error:",
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
| DELETE
|--------------------------------------------------------------------------
| Remove a story from the current user's bookmarks.
|--------------------------------------------------------------------------
*/

export async function DELETE(
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


    const storyId =
      body.storyId;


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


    /*
    |--------------------------------------------------------------------------
    | Delete only this user's bookmark.
    |--------------------------------------------------------------------------
    */

    const deletedBookmark =
      await db
        .delete(storyBookmarks)

        .where(
          and(

            eq(
              storyBookmarks.storyId,
              storyId
            ),

            eq(
              storyBookmarks.userId,
              user.id
            )

          )
        )

        .returning({
          id:
            storyBookmarks.id,
        });


    if (
      deletedBookmark.length === 0
    ) {

      return NextResponse.json(
        {
          message:
            "Bookmark not found.",
        },
        {
          status: 404,
        }
      );

    }


    return NextResponse.json(
      {
        message:
          "Bookmark removed successfully.",
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "Delete bookmark error:",
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
