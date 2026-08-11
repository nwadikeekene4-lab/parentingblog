import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  users,
} from "@/db/schema";


export type CategoryStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  readTime: string;
};


export async function getStoriesByCategory(
  categoryName: string
): Promise<CategoryStory[]> {

  /*
  |--------------------------------------------------------------------------
  | Find the real category
  |--------------------------------------------------------------------------
  */

  const category =
    await db.query.categories.findFirst({
      where: eq(
        categories.name,
        categoryName
      ),
    });


  /*
  |--------------------------------------------------------------------------
  | Category does not exist
  |--------------------------------------------------------------------------
  */

  if (!category) {
    return [];
  }


  /*
  |--------------------------------------------------------------------------
  | Fetch published stories belonging to this category
  |--------------------------------------------------------------------------
  */

  const databaseStories =
    await db
      .select({
        id: stories.id,

        slug: stories.slug,

        title: stories.title,

        excerpt: stories.excerpt,

        coverImage:
          stories.coverImage,

        content:
          stories.content,

        publishedAt:
          stories.publishedAt,

        createdAt:
          stories.createdAt,

        author:
          users.displayName,
      })

      .from(stories)

      .innerJoin(
        users,
        eq(
          stories.authorId,
          users.id
        )
      )

      .where(
        and(

          eq(
            stories.categoryId,
            category.id
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
  | Format stories for StoryCategoryLayout
  |--------------------------------------------------------------------------
  */

  return databaseStories.map(
    (story) => {

      /*
      |--------------------------------------------------------------------------
      | Use stored excerpt.
      |
      | If no excerpt exists, create one from the content.
      |--------------------------------------------------------------------------
      */

      const cleanContent =
        story.content
          .replace(/\s+/g, " ")
          .trim();


      const excerpt =
        story.excerpt?.trim()
          ? story.excerpt.trim()
          : cleanContent.length > 220
          ? `${cleanContent.slice(0, 220)}...`
          : cleanContent;


      /*
      |--------------------------------------------------------------------------
      | Calculate reading time
      |--------------------------------------------------------------------------
      */

      const words =
        cleanContent
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


      /*
      |--------------------------------------------------------------------------
      | Format publication date
      |--------------------------------------------------------------------------
      */

      const publishedDate =
        new Date(
          story.publishedAt ??
          story.createdAt
        ).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );


      return {

        id:
          story.id,

        slug:
          story.slug,

        title:
          story.title,

        excerpt,

        image:
          story.coverImage ??
          "/Images/stories/default-story.jpg",

        author:
          story.author,

        publishedAt:
          publishedDate,

        readTime:
          `${readTime} min read`,

      };

    }
  );
  }
