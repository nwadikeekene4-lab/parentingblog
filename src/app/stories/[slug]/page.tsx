import Image from "next/image";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  storyBookmarks,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";
import BookmarkButton from "./BookmarkButton";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoryPage({
  params,
}: Props) {
  const { slug } = await params;

  const currentUser =
    await getCurrentUser();

  const story =
    await db.query.stories.findFirst({
      where: eq(stories.slug, slug),

      with: {
        author: true,

        category: true,

        images: {
          orderBy: (
            images,
            { asc }
          ) => [
            asc(images.displayOrder),
          ],
        },
      },
    });

  if (!story || story.isDeleted) {
    notFound();
  }

  // Security
  if (story.status !== "published") {
    if (!currentUser) {
      notFound();
    }

    const isAuthor =
      currentUser.id ===
      story.authorId;

    const isAdmin =
      currentUser.role === "admin";

    if (
      !isAuthor &&
      !isAdmin
    ) {
      notFound();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Check whether current user has bookmarked this story
  |--------------------------------------------------------------------------
  */

  let isBookmarked = false;

  if (currentUser) {
    const bookmark =
      await db
        .select({
          id: storyBookmarks.id,
        })

        .from(storyBookmarks)

        .where(
          and(
            eq(
              storyBookmarks.storyId,
              story.id
            ),

            eq(
              storyBookmarks.userId,
              currentUser.id
            )
          )
        )

        .limit(1);

    isBookmarked =
      bookmark.length > 0;
  }

  /*
  |--------------------------------------------------------------------------
  | Calculate reading time
  |--------------------------------------------------------------------------
  */

  const words =
    story.content
      .trim()
      .split(/\s+/).length;

  const readTime =
    Math.max(
      1,
      Math.ceil(words / 200)
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Cover Image */}

      {story.coverImage && (
        <div className="relative mb-10 h-72 overflow-hidden rounded-3xl shadow-xl md:h-[520px]">

          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

        </div>
      )}

      {/* Story Header */}

      <header className="mx-auto mb-12 max-w-3xl">

        <span className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
          {story.category.name}
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          {story.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">

          <span className="font-semibold">
            {story.author.displayName}
          </span>

          <span>•</span>

          <span>
            {story.publishedAt
              ? new Date(
                  story.publishedAt
                ).toLocaleDateString()
              : new Date(
                  story.createdAt
                ).toLocaleDateString()}
          </span>

          <span>•</span>

          <span>
            {readTime} min read
          </span>

        </div>

        {/* Bookmark Button */}

        {currentUser && (
          <div className="mt-6">

            <BookmarkButton
              storyId={story.id}
              initiallyBookmarked={
                isBookmarked
              }
            />

          </div>
        )}

      </header>

      {/* Story Content */}

      <article className="mx-auto mt-12 max-w-3xl">

        <div className="text-lg leading-9 text-slate-700">

          {story.content
            .split(/\n\s*\n/)
            .filter(
              (paragraph) =>
                paragraph.trim() !== ""
            )
            .map(
              (
                paragraph,
                index
              ) => (
                <p
                  key={index}
                  className="mb-8 whitespace-pre-wrap text-justify"
                >
                  {paragraph.trim()}
                </p>
              )
            )}

        </div>

      </article>

      {/* Story Images */}

      {story.images.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl space-y-12">

          {story.images.map(
            (image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-3xl bg-white shadow-lg"
              >

                <div className="relative h-72 w-full md:h-[520px]">

                  <Image
                    src={
                      image.imageUrl
                    }
                    alt={
                      image.caption ||
                      story.title
                    }
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />

                </div>

                {image.caption && (
                  <figcaption className="px-6 py-5 text-center text-sm italic text-slate-500">
                    {
                      image.caption
                    }
                  </figcaption>
                )}

              </figure>
            )
          )}

        </section>
      )}

      {/* End of Story */}

      <section className="mx-auto mt-20 max-w-3xl border-t border-slate-200 pt-10 text-center">

        <h2 className="text-2xl font-bold text-slate-900">
          End of Story
        </h2>

        <p className="mt-4 text-slate-600">
          Thank you for reading this parenting story.
          We hope it inspired, encouraged or helped you
          in some way.
        </p>

      </section>

    </main>
  );
}
