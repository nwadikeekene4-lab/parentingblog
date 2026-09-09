import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { desc, eq, and } from "drizzle-orm";

import { db } from "@/db";
import { stories } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export default async function AdminPublishedStoriesPage() {
  /*
   * ------------------------------------------------------------
   * ADMIN AUTHORIZATION
   * ------------------------------------------------------------
   */

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  if (currentUser.role !== "admin") {
    notFound();
  }

  /*
   * ------------------------------------------------------------
   * LOAD PUBLISHED STORIES
   * ------------------------------------------------------------
   *
   * Only stories that have already been approved/published
   * are displayed here.
   *
   * Deleted stories are excluded.
   *
   */

  const publishedStories = await db.query.stories.findMany({
    where: and(
      eq(stories.status, "published"),
      eq(stories.isDeleted, false)
    ),
    with: {
      author: true,
      category: true,
    },
    orderBy: [
      desc(stories.publishedAt),
      desc(stories.createdAt),
    ],
  });

  /*
   * ------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------
   */

  return (
    <main className="w-full space-y-6">

      {/* Header */}

      <section
        className="
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          via-blue-700
          to-indigo-800
          px-5
          py-6
          text-white
          shadow-lg
          sm:rounded-3xl
          sm:px-7
          sm:py-7
          lg:px-8
        "
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-100 sm:text-sm">
              Administration
            </p>

            <h1
              className="
                mt-1
                text-2xl
                font-bold
                tracking-tight
                sm:text-3xl
              "
            >
              Published Stories
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-blue-100
              "
            >
              View stories that have already been approved
              and published on the website.
            </p>
          </div>

          <div
            className="
              inline-flex
              w-fit
              items-center
              rounded-xl
              bg-white/15
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              backdrop-blur-sm
            "
          >
            {publishedStories.length}{" "}
            {publishedStories.length === 1
              ? "Published Story"
              : "Published Stories"}
          </div>

        </div>
      </section>


      {/* Back */}

      <div>
        <Link
          href="/admin"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            shadow-sm
            transition
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
          "
        >
          ← Back to Admin Dashboard
        </Link>
      </div>


      {/* Empty State */}

      {publishedStories.length === 0 && (
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-12
            text-center
            shadow-sm
            sm:rounded-3xl
            sm:px-8
          "
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📚
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No published stories yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Stories that are approved by an administrator
            will appear here.
          </p>

          <Link
            href="/admin/pending-review"
            className="
              mt-6
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
            "
          >
            Review Pending Stories
          </Link>
        </section>
      )}


      {/* Published Stories */}

      {publishedStories.length > 0 && (
        <section
          className="
            grid
            gap-5
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >
          {publishedStories.map((story) => (
            <article
              key={story.id}
              className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition
                duration-200
                hover:-translate-y-1
                hover:shadow-md
                sm:rounded-3xl
              "
            >

              {/* Cover */}

              {story.coverImage ? (
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 sm:h-56">

                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="
                      object-cover
                      transition
                      duration-300
                      group-hover:scale-105
                    "
                  />

                </div>
              ) : (
                <div
                  className="
                    flex
                    h-52
                    w-full
                    items-center
                    justify-center
                    bg-slate-100
                    text-4xl
                    sm:h-56
                  "
                >
                  📚
                </div>
              )}


              {/* Content */}

              <div className="p-5">

                {/* Category */}

                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-blue-50
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-blue-700
                  "
                >
                  {story.category.name}
                </span>


                {/* Title */}

                <h2
                  className="
                    mt-3
                    line-clamp-2
                    text-xl
                    font-bold
                    leading-tight
                    text-slate-900
                  "
                >
                  {story.title}
                </h2>


                {/* Excerpt */}

                {story.excerpt && (
                  <p
                    className="
                      mt-3
                      line-clamp-3
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    {story.excerpt}
                  </p>
                )}


                {/* Metadata */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-xs
                    text-slate-500
                  "
                >

                  <span className="font-semibold text-slate-700">
                    {story.author.displayName}
                  </span>

                  <span>•</span>

                  <span>
                    {new Date(
                      story.publishedAt ||
                      story.createdAt
                    ).toLocaleDateString("en-NG")}
                  </span>

                  <span>•</span>

                  <span>
                    👁️ {story.views}
                  </span>

                </div>


                {/* Status */}

                <div className="mt-4 flex items-center gap-2">

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-emerald-700
                    "
                  >
                    <span>✓</span>
                    Published
                  </span>

                </div>


                {/* Action */}

                <div className="mt-5 border-t border-slate-100 pt-4">

                  <Link
                    href={`/stories/${story.slug}`}
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-600
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-blue-700
                      active:scale-[0.98]
                    "
                  >
                    View Published Story →
                  </Link>

                </div>

              </div>

            </article>
          ))}
        </section>
      )}

    </main>
  );
      }
