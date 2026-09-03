"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type PendingStory = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  categoryId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  submissionType: "new_submission" | "story_update";
  status: "pending_review";
  submittedAt: string;
  updatedAt: string;
};

export default function AdminPendingReviewPage() {
  const [stories, setStories] = useState<PendingStory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const fetchStories = useCallback(
    async (searchValue = "") => {
      try {
        setError("");

        const isSearch =
          searchValue.trim().length > 0;

        if (isSearch) {
          setSearching(true);
        } else {
          setLoading(true);
        }

        const query = isSearch
          ? `?search=${encodeURIComponent(
              searchValue.trim()
            )}`
          : "";

        const response = await fetch(
          `/api/admin/pending-review${query}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load pending stories."
          );
        }

        setStories(
          Array.isArray(data.stories)
            ? data.stories
            : []
        );
      } catch (err) {
        console.error(
          "Pending review fetch error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load pending stories."
        );
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStories(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, fetchStories]);

  /*
  |--------------------------------------------------------------------------
  | Format dates
  |--------------------------------------------------------------------------
  */

  function formatDate(
    date: string
  ) {
    try {
      return new Intl.DateTimeFormat(
        "en-NG",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(new Date(date));
    } catch {
      return "Unknown date";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="w-full space-y-5">

        <div className="h-28 animate-pulse rounded-3xl bg-white/70" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="h-44 animate-pulse bg-slate-100" />

              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">

      {/* Header */}
      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          bg-gradient-to-br
          from-amber-500
          via-orange-500
          to-red-500
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
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-20
            h-48
            w-48
            rounded-full
            bg-white/10
            blur-2xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            right-20
            h-40
            w-40
            rounded-full
            bg-white/10
            blur-3xl
          "
        />

        <div className="relative">

          <div className="flex items-center gap-2">
            <span className="text-xl">
              ⏳
            </span>

            <p className="text-xs font-semibold uppercase tracking-wide text-white/80 sm:text-sm">
              Story Management
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Pending Review
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                Review stories submitted by registered users
                before they appear on the website.
              </p>
            </div>

            <div
              className="
                rounded-xl
                bg-white/15
                px-4
                py-2
                backdrop-blur-sm
              "
            >
              <p className="text-xs text-white/70">
                Awaiting review
              </p>

              <p className="text-xl font-bold">
                {stories.length}
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Search */}
      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          sm:rounded-3xl
          sm:p-5
        "
      >

        <div className="relative">

          <span
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-lg
              text-slate-400
            "
          >
            🔍
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search pending stories by title..."
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              py-3
              pl-11
              pr-12
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-blue-400
              focus:bg-white
              focus:ring-2
              focus:ring-blue-100
            "
          />

          {searching && (
            <span
              className="
                absolute
                right-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                animate-spin
                rounded-full
                border-2
                border-slate-300
                border-t-blue-600
              "
            />
          )}

        </div>

      </section>


      {/* Error */}
      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          <div className="flex items-start gap-3">

            <span>⚠️</span>

            <div className="flex-1">
              <p className="font-semibold">
                Unable to load stories
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchStories(search)
              }
              className="
                rounded-lg
                bg-red-600
                px-3
                py-2
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-red-700
              "
            >
              Retry
            </button>

          </div>
        </div>
      )}


      {/* Empty state */}
      {!error && stories.length === 0 && (
        <section
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            px-6
            py-14
            text-center
            shadow-sm
          "
        >

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-slate-100
              text-2xl
            "
          >
            {search ? "🔍" : "✓"}
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            {search
              ? "No matching stories"
              : "No stories waiting for review"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {search
              ? "Try searching with a different story title."
              : "New submissions and story updates awaiting approval will appear here."}
          </p>

        </section>
      )}


      {/* Story list */}
      {stories.length > 0 && (
        <section>

          <div className="mb-3 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Stories
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {stories.length}{" "}
                {stories.length === 1
                  ? "story"
                  : "stories"}{" "}
                awaiting review
              </p>
            </div>

          </div>


          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >

            {stories.map((story) => {

              const isUpdate =
                story.submissionType ===
                "story_update";

              return (
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
                    hover:-translate-y-0.5
                    hover:shadow-md
                    sm:rounded-3xl
                  "
                >

                  {/* Cover */}
                  <div
                    className="
                      relative
                      h-48
                      overflow-hidden
                      bg-slate-100
                      sm:h-52
                    "
                  >

                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        loading="lazy"
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          bg-gradient-to-br
                          from-slate-100
                          to-slate-200
                          text-4xl
                        "
                      >
                        📖
                      </div>
                    )}


                    {/* Submission badge */}
                    <div className="absolute left-3 top-3">

                      <span
                        className={`
                          inline-flex
                          items-center
                          rounded-full
                          px-3
                          py-1.5
                          text-[11px]
                          font-bold
                          shadow-sm
                          backdrop-blur-sm
                          ${
                            isUpdate
                              ? "bg-purple-600 text-white"
                              : "bg-amber-500 text-white"
                          }
                        `}
                      >
                        {isUpdate
                          ? "🔄 Story Update"
                          : "🆕 New Submission"}
                      </span>

                    </div>

                  </div>


                  {/* Content */}
                  <div className="p-4 sm:p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {story.category}
                        </p>

                        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-slate-900 sm:text-lg">
                          {story.title}
                        </h3>

                      </div>

                    </div>


                    {/* Excerpt */}
                    {story.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-5 text-slate-500">
                        {story.excerpt}
                      </p>
                    )}


                    {/* Author */}
                    <div
                      className="
                        mt-4
                        rounded-xl
                        bg-slate-50
                        px-3
                        py-3
                      "
                    >

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Author
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {story.author.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {story.author.email}
                      </p>

                    </div>


                    {/* Date */}
                    <div className="mt-4">

                      <div className="flex items-center justify-between gap-3 text-xs">

                        <span className="text-slate-400">
                          {isUpdate
                            ? "Updated"
                            : "Submitted"}
                        </span>

                        <span className="text-right font-medium text-slate-600">
                          {formatDate(
                            isUpdate
                              ? story.updatedAt
                              : story.submittedAt
                          )}
                        </span>

                      </div>

                    </div>


                    {/* Actions */}
                    <div className="mt-5 flex gap-2">

                      <Link
  href={`/admin/pending-review/${story.slug}`}
  className="
    flex
    flex-1
    items-center
    justify-center
    rounded-xl
    border
    border-slate-200
    bg-white
    px-3
    py-2.5
    text-sm
    font-semibold
    text-slate-700
    transition
    hover:border-blue-200
    hover:bg-blue-50
    hover:text-blue-600
    active:scale-[0.98]
  "
>
  View Story
</Link>
                      <button
                        type="button"
                        disabled
                        className="
                          flex
                          flex-1
                          cursor-not-allowed
                          items-center
                          justify-center
                          rounded-xl
                          bg-slate-100
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          text-slate-400
                        "
                        title="Review actions will be added next"
                      >
                        Review
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        </section>
      )}

    </div>
  );
      }
