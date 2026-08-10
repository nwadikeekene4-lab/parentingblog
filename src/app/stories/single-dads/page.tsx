import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  users,
} from "@/db/schema";

import StoryCategoryLayout from "../components/StoryCategoryLayout";

export default async function SingleDadsPage() {

  /*
  |--------------------------------------------------------------------------
  | Find the real "Single Dads" category
  |--------------------------------------------------------------------------
  */

  const category =
    await db.query.categories.findFirst({
      where: eq(
        categories.name,
        "Single Dads"
      ),
    });


  /*
  |--------------------------------------------------------------------------
  | No category found
  |--------------------------------------------------------------------------
  */

  if (!category) {

    return (
      <StoryCategoryLayout
        title="Single Dads"
        description="Read inspiring stories, challenges and victories from fathers raising children on their own."
        image="/Images/stories/singledad.jpg"
        stories={[]}
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Fetch real published stories belonging to this category
  |--------------------------------------------------------------------------
  */

  const databaseStories =
    await db
      .select({
        id: stories.id,
        slug: stories.slug,
        title: stories.title,
        coverImage: stories.coverImage,
        content: stories.content,
        publishedAt: stories.publishedAt,
        createdAt: stories.createdAt,
        author: users.displayName,
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
  | Format stories for the category layout
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
          id: story.id,

          slug: story.slug,

          title: story.title,

          image:
            story.coverImage ??
            "/Images/stories/default-story.jpg",

          author:
            story.author,

          publishedAt:
            new Date(
              story.publishedAt ??
              story.createdAt
            ).toLocaleDateString(),

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
      stories={formattedStories}
    />
  );
}
