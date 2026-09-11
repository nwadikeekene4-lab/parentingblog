"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type FeaturedStory = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  excerpt: string | null;
  category: string;
  author: string;
  views: number | null;
  publishedAt: string | null;
  createdAt: string;
  featured: boolean;
};

type ApiResponse = {
  featuredStories: FeaturedStory[];
  availableStories: FeaturedStory[];
};

export default function AdminFeaturedStoriesPage() {
  const [featuredStories, setFeaturedStories] =
    useState<FeaturedStory[]>([]);

  const [availableStories, setAvailableStories] =
    useState<FeaturedStory[]>([]);

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [searching, setSearching] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD STORIES
  |--------------------------------------------------------------------------
  */

  const loadStories = useCallback(
    async (
      searchValue = ""
    ) => {
      try {
        if (searchValue) {
          setSearching(true);
        } else {
          setLoading(true);
        }

        setError("");

        const query =
          searchValue.trim()
            ? `?search=${encodeURIComponent(
                searchValue.trim()
              )}`
            : "";

        const response =
          await fetch(
            `/api/admin/featured${query}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        if (response.status === 401) {
          window.location.href =
            "/auth";
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to manage featured stories."
          );
        }

        const data =
          (await response.json()) as
            | ApiResponse
            | {
                message?: string;
              };

        if (!response.ok) {
          throw new Error(
            "message" in data &&
              data.message
              ? data.message
              : "Failed to load featured stories."
          );
        }

        const result =
          data as ApiResponse;

        setFeaturedStories(
          Array.isArray(
            result.featuredStories
          )
            ? result.featuredStories
            : []
        );

        setAvailableStories(
          Array.isArray(
            result.availableStories
          )
            ? result.availableStories
            : []
        );
      } catch (error) {
        console.error(
          "Load featured stories error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load featured stories."
        );
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const value =
      searchInput.trim();

    setSearch(value);
    loadStories(value);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    loadStories("");
  }

  /*
  |--------------------------------------------------------------------------
  | FEATURE / UNFEATURE
  |--------------------------------------------------------------------------
  */

  async function updateFeatured(
    storyId: string,
    featured: boolean
  ) {
    try {
      setUpdatingId(storyId);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          "/api/admin/featured",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              storyId,
              featured,
            }),
          }
        );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/auth";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to update featured story."
        );
      }

      setSuccess(
        data.message ??
          (featured
            ? "Story added to featured stories."
            : "Story removed from featured stories.")
      );

      /*
      |--------------------------------------------------------------------------
      | Reload current search
      |--------------------------------------------------------------------------
      */

      await loadStories(search);
    } catch (error) {
      console.error(
        "Update featured story error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update featured story."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DATE FORMAT
  |--------------------------------------------------------------------------
  */

  function formatDate(
    date: string | null,
    fallback: string
  ) {
    return new Date(
      date ?? fallback
    ).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STORY CARD
  |--------------------------------------------------------------------------
  */

  function StoryCard({
    story,
    isFeatured,
  }: {
    story: FeaturedStory;
    isFeatured: boolean;
  }) {
    const busy =
      updatingId === story.id;

    return (
      <article
        className="
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
        "
      >
        {/* Image */}

        {story.coverImage ? (
          <div className="relative h-48 w-full overflow-hidden bg-slate-100">
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />

            {isFeatured && (
              <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-bold text-yellow-950 shadow-sm">
                ⭐ Featured
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-4xl">
            📚
          </div>
        )}

        {/* Content */}

        <div className="p-5">

          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              {story.category}
            </span>

            {isFeatured && (
              <span className="text-xs font-semibold text-yellow-600">
                Featured
              </span>
            )}
          </div>

          <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900">
            {story.title}
          </h2>

          {story.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {story.excerpt}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {story.author}
            </span>

            <span>•</span>

            <span>
              {formatDate(
                story.publishedAt,
                story.createdAt
              )}
            </span>

            <span>•</span>

            <span>
              👁️ {story.views ?? 0}
            </span>
          </div>

          {/* Actions */}

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">

            <Link
              href={`/stories/${story.slug}`}
              className="
                inline-flex
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
                hover:text-blue-700
              "
            >
              View Story
            </Link>

            {isFeatured ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  updateFeatured(
                    story.id,
                    false
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-700
                  px-3
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {busy
                  ? "Updating..."
                  : "Remove"}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  updateFeatured(
                    story.id,
                    true
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-yellow-500
                  px-3
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-yellow-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {busy
                  ? "Adding..."
                  : "Feature Story"}
              </button>
            )}

          </div>
        </div>
      </article>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="w-full space-y-6">

      {/* Header */}

      <section
        className="
          rounded-2xl
          bg-gradient-to-br
          from-yellow-500
          via-amber-500
          to-orange-600
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
            <p className="text-xs font-medium uppercase tracking-wide text-yellow-100 sm:text-sm">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Stories
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-yellow-100">
              Choose published stories to highlight across the website.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            {featuredStories.length}{" "}
            {featuredStories.length === 1
              ? "Featured Story"
              : "Featured Stories"}
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

      {/* Messages */}

      {success && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>{success}</p>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="font-bold text-emerald-700"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="font-bold text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Search Stories
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search all published, non-deleted stories by title, category, or author.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
            placeholder="Search by title, category, or author..."
            className="
              h-11
              min-w-0
              flex-1
              rounded-xl
              border
              border-slate-300
              bg-white
              px-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
            "
          />

          <button
            type="submit"
            disabled={searching}
            className="
              h-11
              rounded-xl
              bg-blue-600
              px-6
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {searching
              ? "Searching..."
              : "Search Stories"}
          </button>

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >
              Clear
            </button>
          )}
        </form>

      </section>

      {/* Loading */}

      {loading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading featured stories...
          </p>

        </section>
      )}

      {!loading && (
        <>
          {/* Currently Featured */}

          <section>

            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Currently Featured
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Stories currently highlighted on the website.
                </p>
              </div>

              <span className="text-sm font-semibold text-slate-400">
                {featuredStories.length}
              </span>
            </div>

            {featuredStories.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {featuredStories.map(
                  (story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      isFeatured
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                <div className="text-4xl">
                  ⭐
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  No featured stories yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Search for a published story below and feature it.
                </p>
              </div>
            )}

          </section>

          {/* Search Results / Available Stories */}

          <section>

            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {search
                    ? "Search Results"
                    : "Published Stories"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? `Showing published stories matching "${search}".`
                    : "Search for a story when you want to add one to Featured."}
                </p>
              </div>

              <span className="text-sm font-semibold text-slate-400">
                {availableStories.length}
              </span>
            </div>

            {availableStories.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {availableStories.map(
                  (story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      isFeatured={false}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                <div className="text-4xl">
                  🔎
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {search
                    ? "No matching stories"
                    : "No other published stories"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {search
                    ? "Try a different title, category, or author."
                    : "All published stories are currently featured."}
                </p>
              </div>
            )}

          </section>
        </>
      )}

    </main>
  );
}
