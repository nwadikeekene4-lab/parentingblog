import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  users,
  categories,
} from "@/db/schema";

export async function GET() {
  try {
    const featuredStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        excerpt: stories.excerpt,
        content: stories.content,
        coverImage: stories.coverImage,
        publishedAt: stories.publishedAt,

        author: users.displayName,

        category: categories.name,
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
            stories.status,
            "published"
          ),

          eq(
            stories.featured,
            true
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

    const formattedStories =
      featuredStories.map(
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

            image:
              story.coverImage ??
              "/Images/stories/default-story.jpg",

            title: story.title,

            category:
              story.category,

            excerpt:
              story.excerpt,

            author:
              story.author,

            readTime:
              `${readTime} min read`,

            publishedAt:
              story.publishedAt,
          };
        }
      );

    return NextResponse.json(
      {
        stories:
          formattedStories,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Fetch featured stories error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to fetch featured stories.",
      },
      {
        status: 500,
      }
    );
  }
          }
