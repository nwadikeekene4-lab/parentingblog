import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  categories,
  storyImages,
  tags,
  storyTags,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { generateExcerpt } from "@/lib/story";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createTagSlug(tag: string) {
  return tag
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
      coverImageUrl,
      coverImagePublicId,
      storyImages: uploadedImages = [],
      tags: selectedTags = [],
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
          message:
            "Invalid story status.",
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
          message:
            "Category not found.",
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

    const excerpt =
      generateExcerpt(content);
        const story = await db.transaction(
      async (tx) => {

        const [newStory] =
          await tx
            .insert(stories)
            .values({
              title: title.trim(),

              slug,

              excerpt,

              content: content.trim(),

              coverImage:
                coverImageUrl ?? null,

              coverImagePublicId:
                coverImagePublicId ?? null,

              authorId: user.id,

              categoryId:
                existingCategory.id,

              status:
                status === "published"
                  ? "pending_review"
                  : "draft",

              publishedAt:
                status === "published"
                  ? new Date()
                  : null,
            })
            .returning();

        if (uploadedImages.length > 0) {

          await tx
            .insert(storyImages)
            .values(
              uploadedImages.map(
                (
                  image: {
                    url: string;
                    publicId: string;
                  },
                  index: number
                ) => ({
                  storyId:
                    newStory.id,

                  imageUrl:
                    image.url,

                  publicId:
                    image.publicId,

                  displayOrder:
                    index,
                })
              )
            );

        }

        for (const tagName of selectedTags) {

          const cleanTag =
            tagName.trim();

          if (!cleanTag) {
            continue;
          }

          let existingTag =
            await tx.query.tags.findFirst({
              where: (
                tags,
                { eq }
              ) =>
                eq(
                  tags.name,
                  cleanTag
                ),
            });

          if (!existingTag) {

            const [newTag] =
              await tx
                .insert(tags)
                .values({
                  name: cleanTag,

                  slug:
                    createTagSlug(
                      cleanTag
                    ),
                })
                .returning();

            existingTag =
              newTag;

          }

          const alreadyLinked =
            await tx.query.storyTags.findFirst(
              {
                where: (
                  storyTags,
                  { and, eq }
                ) =>
                  and(
                    eq(
                      storyTags.storyId,
                      newStory.id
                    ),

                    eq(
                      storyTags.tagId,
                      existingTag.id
                    )
                  ),
              }
            );

          if (!alreadyLinked) {

            await tx
              .insert(storyTags)
              .values({
                storyId:
                  newStory.id,

                tagId:
                  existingTag.id,
              });

          }

        }

        return newStory;

      }
    );

        return NextResponse.json(
      {
        message:
          status === "published"
            ? "Story submitted for review successfully."
            : "Draft saved successfully.",

        story,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "Create story error:",
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
