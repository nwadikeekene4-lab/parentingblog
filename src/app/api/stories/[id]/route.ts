import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import { generateExcerpt } from "@/lib/story";
import cloudinary from "@/lib/cloudinary";

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

type ImageInput = {
  url: string;
  publicId: string;
  caption?: string | null;
};

type Body = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
  coverImageUrl?: unknown;
  coverImagePublicId?: unknown;
  storyImages?: unknown;
};

const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Unknown error";

async function getStoryImages(id: string, source = db) {
  return source
    .select({
      id: storyImages.id,
      storyId: storyImages.storyId,
      imageUrl: storyImages.imageUrl,
      publicId: storyImages.publicId,
      caption: storyImages.caption,
      displayOrder: storyImages.displayOrder,
    })
    .from(storyImages)
    .where(eq(storyImages.storyId, id))
    .orderBy(storyImages.displayOrder);
}

/* GET */

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      );

    const { id } = await context.params;
    if (!id)
      return NextResponse.json(
        { message: "The story could not be identified." },
        { status: 400 }
      );

    const result = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        excerpt: stories.excerpt,
        slug: stories.slug,
        coverImage: stories.coverImage,
        coverImagePublicId: stories.coverImagePublicId,
        categoryId: stories.categoryId,
        category: categories.name,
        status: stories.status,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .innerJoin(
        categories,
        eq(stories.categoryId, categories.id)
      )
      .where(
        and(
          eq(stories.id, id),
          eq(stories.authorId, user.id),
          eq(stories.status, "pending_review"),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    if (!result[0])
      return NextResponse.json(
        {
          message:
            "This story could not be found, or it is no longer available for editing.",
        },
        { status: 404 }
      );

    return NextResponse.json({
      story: {
        ...result[0],
        images: await getStoryImages(id),
      },
    });
  } catch (error) {
    console.error("GET edit story error:", error);

    return NextResponse.json(
      {
        message:
          "We couldn't load this story right now. Please refresh the page and try again.",
      },
      { status: 500 }
    );
  }
}

/* PUT */

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const newPublicIds: string[] = [];

  try {
    const user = await getCurrentUser();

    if (!user)
      return NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      );

    const { id } = await context.params;

    if (!id)
      return NextResponse.json(
        { message: "The story could not be identified." },
        { status: 400 }
      );

    let body: Body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request data." },
        { status: 400 }
      );
    }

    const {
      title,
      content,
      category,
      coverImageUrl,
      coverImagePublicId,
      storyImages: images,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim()
    )
      return NextResponse.json(
        { message: "Please enter a story title." },
        { status: 400 }
      );

    if (
      typeof content !== "string" ||
      !content.trim()
    )
      return NextResponse.json(
        { message: "Please write your story." },
        { status: 400 }
      );

    if (
      typeof category !== "string" ||
      !category.trim()
    )
      return NextResponse.json(
        { message: "Please select a category." },
        { status: 400 }
      );

    if (
      images !== undefined &&
      (!Array.isArray(images) ||
        images.some(
          (image) =>
            !image ||
            typeof image !== "object" ||
            typeof (image as ImageInput).url !== "string" ||
            typeof (image as ImageInput).publicId !== "string"
        ))
    )
      return NextResponse.json(
        { message: "One or more story images are invalid." },
        { status: 400 }
      );

    if (
      coverImageUrl !== undefined &&
      coverImageUrl !== null &&
      typeof coverImageUrl !== "string"
    )
      return NextResponse.json(
        { message: "The cover image URL is invalid." },
        { status: 400 }
      );

    if (
      coverImagePublicId !== undefined &&
      coverImagePublicId !== null &&
      typeof coverImagePublicId !== "string"
    )
      return NextResponse.json(
        { message: "The cover image identifier is invalid." },
        { status: 400 }
      );

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanCategory = category.trim();

    const existing = await db.query.stories.findFirst({
      where: (s, { eq, and }) =>
        and(
          eq(s.id, id),
          eq(s.authorId, user.id),
          eq(s.status, "pending_review"),
          eq(s.isDeleted, false)
        ),
    });

    if (!existing)
      return NextResponse.json(
        {
          message:
            "This story cannot be edited because it was not found or is no longer awaiting review.",
        },
        { status: 404 }
      );

    const categoryRow =
      await db.query.categories.findFirst({
        where: (c, { eq }) =>
          eq(c.name, cleanCategory),
      });

    if (!categoryRow)
      return NextResponse.json(
        { message: "The selected category is not available." },
        { status: 400 }
      );

    const titleChanged =
      cleanTitle !== existing.title;

    const contentChanged =
      cleanContent !== existing.content;

    const categoryChanged =
      categoryRow.id !== existing.categoryId;

    const coverChanged =
      coverImageUrl !== undefined &&
      (coverImageUrl !== existing.coverImage ||
        coverImagePublicId !==
          existing.coverImagePublicId);

    const imagesChanged =
      Array.isArray(images);

    if (
      !titleChanged &&
      !contentChanged &&
      !categoryChanged &&
      !coverChanged &&
      !imagesChanged
    )
      return NextResponse.json({
        message: "There were no changes to save.",
      });

    /* New cover asset */
    if (
      coverChanged &&
      typeof coverImagePublicId === "string" &&
      coverImagePublicId &&
      coverImagePublicId !==
        existing.coverImagePublicId
    ) {
      newPublicIds.push(
        coverImagePublicId
      );
    }

    /* New story image assets */
    if (images) {
      const oldImages =
        await getStoryImages(id);

      const oldIds = new Set(
        oldImages.map((i) => i.publicId)
      );

      for (const image of images as ImageInput[]) {
        if (!oldIds.has(image.publicId))
          newPublicIds.push(image.publicId);
      }
    }

    /* Generate unique slug only when title changed */
    let slug = existing.slug;

    if (titleChanged) {
      const base = slugify(cleanTitle);

      if (!base)
        return NextResponse.json(
          {
            message:
              "Please choose a title containing letters or numbers.",
          },
          { status: 400 }
        );

      slug = base;
      let n = 1;

      while (true) {
        const found =
          await db.query.stories.findFirst({
            where: (s, { eq }) =>
              eq(s.slug, slug),
          });

        if (!found || found.id === id)
          break;

        slug = `${base}-${n++}`;
      }
    }

    const oldCoverId =
      existing.coverImagePublicId;

    const oldImages = images
      ? await getStoryImages(id)
      : [];

    const result = await db.transaction(
      async (tx) => {
        const update: Record<string, unknown> = {};

        if (titleChanged) {
          update.title = cleanTitle;
          update.slug = slug;
        }

        if (contentChanged) {
          update.content = cleanContent;
          update.excerpt =
            generateExcerpt(cleanContent);
        }

        if (categoryChanged)
          update.categoryId = categoryRow.id;

        if (coverChanged) {
          update.coverImage =
            coverImageUrl ?? null;
          update.coverImagePublicId =
            coverImagePublicId ?? null;
        }

        if (Object.keys(update).length)
          await tx
            .update(stories)
            .set(update)
            .where(eq(stories.id, id));

        if (images) {
          await tx
            .delete(storyImages)
            .where(eq(storyImages.storyId, id));

          if (images.length)
            await tx.insert(storyImages).values(
              (images as ImageInput[]).map(
                (image, index) => ({
                  storyId: id,
                  imageUrl: image.url,
                  publicId: image.publicId,
                  caption:
                    image.caption ?? null,
                  displayOrder: index,
                })
              )
            );
        }

        const story =
          await tx.query.stories.findFirst({
            where: (s, { eq }) =>
              eq(s.id, id),
          });

        return story;
      }
    );

    if (!result)
      throw new Error(
        "The story could not be retrieved after saving."
      );

    /*
     * Remove old Cloudinary assets only AFTER
     * the database transaction succeeds.
     */
    const removedIds: string[] = [];

    if (
      coverChanged &&
      oldCoverId &&
      oldCoverId !== coverImagePublicId
    )
      removedIds.push(oldCoverId);

    if (images) {
      const newIds = new Set(
        (images as ImageInput[]).map(
          (i) => i.publicId
        )
      );

      oldImages.forEach((image) => {
        if (!newIds.has(image.publicId))
          removedIds.push(image.publicId);
      });
    }

    await Promise.all(
      removedIds
        .filter(Boolean)
        .map((publicId) =>
          cloudinary.uploader
            .destroy(publicId)
            .catch((error) =>
              console.error(
                "Cloudinary cleanup error:",
                publicId,
                error
              )
            )
        )
    );

    return NextResponse.json({
      message:
        "Changes saved successfully. Your story remains pending review.",
      story: {
        ...result,
        images: await getStoryImages(id),
      },
    });
  } catch (error) {
    console.error(
      "Update pending review story error:",
      error
    );

    /*
     * Database failed after Cloudinary upload.
     * Remove only assets uploaded during this request.
     */
    await Promise.all(
      [...new Set(newPublicIds)]
        .map((publicId) =>
          cloudinary.uploader
            .destroy(publicId)
            .catch((cleanupError) =>
              console.error(
                "Failed to clean up Cloudinary asset:",
                cleanupError
              )
            )
        )
    );

    return NextResponse.json(
      {
        message:
          "Your changes could not be saved. Please try again.",
        error: errorMessage(error),
      },
      { status: 500 }
    );
  }
             }
