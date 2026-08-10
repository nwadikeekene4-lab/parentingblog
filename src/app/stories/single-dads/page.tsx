import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  users,
  categories,
} from "@/db/schema";

import StoryCategoryLayout from "../components/StoryCategoryLayout";


export default async function SingleDadsPage() {

  /*
  |--------------------------------------------------------------------------
  | Fetch published Single Dads stories
  |--------------------------------------------------------------------------
  */

  const databaseStories =
    await db
      .select({

        id:
          stories.id,

        slug:
          stories.slug,

        title:
          stories.title,

        content:
          stories.content,

        coverImage:
          stories.coverImage,

        publishedAt:
          stories.publishedAt,

        author:
          users.displayName,

        category:
          categories.name,

      })

      .from(stories)

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
            categories.slug,
            "single-dads"
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
  | Convert database stories into the format expected
  | by StoryCategoryLayout
  |--------------------------------------------------------------------------
  */

  const formattedStories =
    databaseStories.map(
      (story) => {

        const words =
          story.content
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;


        const readTime =
          Math.max(
            1,
            Math.ceil(
              words / 200
            )
          );


        return {

          /*
          |--------------------------------------------------------------------------
          | IMPORTANT:
          | This is the REAL database stories.id.
          |
          | BookmarkButton will use this ID.
          |--------------------------------------------------------------------------
          */

          id:
            story.id,

          slug:
            story.slug,

          title:
            story.title,

          /*
          |--------------------------------------------------------------------------
          | Temporary preview text.
          |
          | The full story page still uses story.content.
          |--------------------------------------------------------------------------
          */

          excerpt:
            story.content.length > 220
              ? `${story.content
                  .trim()
                  .slice(0, 220)
                  .trim()}...`
              : story.content.trim(),

          image:
            story.coverImage ??
            "/Images/stories/default-story.jpg",

          author:
            story.author,

          publishedAt:
            story.publishedAt
              ? new Date(
                  story.publishedAt
                ).toLocaleDateString()
              : "",

          readTime:
            `${readTime} min read`,

        };

      }
    );


  return (

    <StoryCategoryLayout

      title="Single Dads"

      description="Read inspiring stories, challenges and victories from fathers raising children on their own."

      image="/Images/stories/singledad.jpg"

      stories={
        formattedStories
      }

    />

  );

        }
