import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const {
      title,
      content,
      category,
      status,
    } = body;

    if (
      !title ||
      !content ||
      !category ||
      !status
    ) {
      return NextResponse.json(
        {
          message:
            "Title, content, category and status are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status !== "draft" &&
      status !== "published"
    ) {
      return NextResponse.json(
        {
          message: "Invalid story status.",
        },
        {
          status: 400,
        }
      );
    }

    const existingCategory =
      await db.query.categories.findFirst({
        where: (categories, { eq }) =>
          eq(categories.name, category),
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    let slug = createSlug(title);

    let counter = 1;

    while (true) {
      const existingStory =
        await db.query.stories.findFirst({
          where: (stories, { eq }) =>
            eq(stories.slug, slug),
        });

      if (!existingStory) {
        break;
      }

      slug = `${createSlug(title)}-${counter}`;
      counter++;
             }

        await db.insert(stories).values({
      title: title.trim(),

      slug,

      content: content.trim(),

      authorId: user.id,

      categoryId: existingCategory.id,

      status:
        status === "published"
          ? "pending_review"
          : "draft",

      publishedAt:
        status === "published"
          ? new Date()
          : null,
    });

    return NextResponse.json(
      {
        message:
          status === "published"
            ? "Story submitted for review successfully."
            : "Draft saved successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
        }
