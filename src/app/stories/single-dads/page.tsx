import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  stories,
  users,
} from "@/db/schema";

import StoryCategoryLayout from "../components/StoryCategoryLayout";

export default async function SingleDadsPage() {
  /*
  |--------------------------------------------------------------------------
  | Find the real "Single Dads" category
  |--------------------------------------------------------------------------
  |
  | We deliberately use the category NAME here instead of guessing its slug.
  | The database gives us the real category UUID.
  |
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
  | Fetch real stories belonging to this category
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | stories.categoryId is compared with the REAL category.id.
  |
  */

  const categoryStories =
    await db
      .select({
        id: stories.id,
        slug: stories.slug,
        title: stories.title,
        content: stories.content,
        image: stories.coverImage,
        author: users.displayName,
        publishedAt: stories.publishedAt,
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
        asc(stories.publishedAt)
      );

  /*
  |--------------------------------------------------------------------------
  | Format stories for StoryCategoryLayout
  |--------------------------------------------------------------------------
  |
  | We are NOT using stories.excerpt.
  |
  */

  const formattedStories =
    categoryStories.map(
      (story) => {
        const words =
          story.content
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

        const readTime = Math.max(
          1,
          Math.ceil(words / 200)
        );

        return {
          id: story.id,

          slug: story.slug,

          title: story.title,

          image:
            story.image ??
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
      title={
        category.name
      }

      description={
        category.description ??
        "Read inspiring stories, challenges and victories from fathers raising children on their own."
      }

      image={
        category.image ??
        "/Images/stories/singledad.jpg"
      }

      stories={
        formattedStories
      }
    />
  );
        }
