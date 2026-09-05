"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MyStoryCard from "@/app/components/dashboard/MyStoryCard";

type StoryImage = {
  id?: string;
  imageUrl: string;
  publicId?: string;
  caption?: string | null;
  displayOrder?: number;
};

type Story = {
  id: string;
  title: string;
  slug: string;

  coverImage: string | null;

  images: StoryImage[];

  category: string;

  views: number;
  likes: number;
  comments: number;
  bookmarks: number;

  featured: boolean;

  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function MyStoriesContent() {
  const searchParams = useSearchParams();
  const revisedParam = searchParams.get("revised");

  const [showSuccessBanner, setShowSuccessBanner] = useState(
    Boolean(revisedParam)
  );

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("Newest");

  const [stories, setStories] =
    useState<Story[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD STORIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function loadStories() {

      try {

        setLoading(true);

        setError("");

        const response =
          await fetch(
            "/api/stories",
            {
              method: "GET",
              cache: "no-store",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ??
              "Failed to load your stories."
          );

        }


        setStories(
          data.stories ?? []
        );


      } catch (error) {

        console.error(
          "Load my stories error:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );


      } finally {

        setLoading(false);

      }

    }


    loadStories();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | SEARCH + SORT
  |--------------------------------------------------------------------------
  */

  const filteredStories =
    useMemo(() => {

      let filtered =
        stories.filter((story) =>
          story.title
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        );


      switch (sortBy) {

        case "Oldest":

          filtered = [
            ...filtered,
          ].sort(
            (a, b) =>
              new Date(
                a.publishedAt ??
                  a.createdAt
              ).getTime() -
              new Date(
                b.publishedAt ??
                  b.createdAt
              ).getTime()
          );

          break;


        case "Most Viewed":

          filtered = [
            ...filtered,
          ].sort(
            (a, b) =>
              b.views - a.views
          );

          break;


        case "Featured":

          filtered =
            filtered.filter(
              (story) =>
                story.featured
            );

          break;


        case "Newest":

        default:

          filtered = [
            ...filtered,
          ].sort(
            (a, b) =>
              new Date(
                b.publishedAt ??
                  b.createdAt
              ).getTime() -
              new Date(
                a.publishedAt ??
                  a.createdAt
              ).getTime()
          );

          break;

      }


      return filtered;

    }, [
      stories,
      search,
      sortBy,
    ]);


  return (

    <div className="space-y-8">


      {/* Header */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            My Stories
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage all your published parenting stories.
          </p>

        </div>


        <Link
          href="/users-dashboard/write-story"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Write Story
        </Link>

      </section>


      {/* Success Notification Banner */}

      {showSuccessBanner && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">✓</span>
            <p className="text-sm font-medium">
              Your story changes have been successfully submitted for administrator review! Your published story remains live until approved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-600 hover:text-emerald-800 font-semibold px-3 py-1"
          >
            ✕
          </button>
        </div>
      )}


      {/* Search & Filters */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <input
          type="text"
          placeholder="Search your stories..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:max-w-md"
        />


        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >

          <option>
            Newest
          </option>

          <option>
            Oldest
          </option>

          <option>
            Most Viewed
          </option>

          <option>
            Featured
          </option>

        </select>

      </section>


      {/* Loading */}

      {loading && (

        <section className="rounded-2xl bg-white p-12 text-center shadow-sm">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-5 text-sm text-gray-600">
            Loading your published stories...
          </p>

        </section>

      )}


      {/* Error */}

      {!loading &&
        error && (

        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <h2 className="text-xl font-semibold text-red-900">
            Unable to load your stories
          </h2>

          <p className="mt-3 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>

        </section>

      )}


      {/* Stories */}

      {!loading &&
        !error &&
        filteredStories.length > 0 && (

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredStories.map(
            (story) => {

              /*
              |--------------------------------------------------------------------------
              | Use cover image first.
              |
              | If there is no cover image, use
              | the first additional story image.
              |--------------------------------------------------------------------------
              */

              const cardImage =
                story.coverImage ??
                story.images?.[0]?.imageUrl ??
                "/images/loginimage.png";


              /*
              |--------------------------------------------------------------------------
              | Format published date
              |--------------------------------------------------------------------------
              */

              const publishedDate =
                story.publishedAt
                  ? new Date(
                      story.publishedAt
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month:
                          "long",
                        day:
                          "numeric",
                        year:
                          "numeric",
                      }
                    )
                  : new Date(
                      story.createdAt
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month:
                          "long",
                        day:
                          "numeric",
                        year:
                          "numeric",
                      }
                    );


              return (

                <MyStoryCard
                  key={story.id}

                  id={story.id}

                  slug={story.slug}

                  title={story.title}

                  category={
                    story.category
                  }

                  image={
                    cardImage
                  }

                  views={
                    story.views
                  }

                  likes={
                    story.likes
                  }

                  comments={
                    story.comments
                  }

                  bookmarks={
                    story.bookmarks
                  }

                  publishedAt={
                    publishedDate
                  }

                  featured={
                    story.featured
                  }

                />

              );

            }
          )}

        </section>

      )}


      {/* Empty State */}

      {!loading &&
        !error &&
        filteredStories.length === 0 && (

        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">

          <div className="text-6xl">
            📚
          </div>


          <h2 className="mt-6 text-2xl font-semibold text-gray-900">

            {search
              ? "No matching stories found"
              : "No published stories yet"}

          </h2>


          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">

            {search
              ? "Try another search keyword."
              : "Start sharing your parenting journey by writing your first story."}

          </p>


          {!search && (

            <Link
              href="/users-dashboard/write-story"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Write Your First Story
            </Link>

          )}

        </section>

      )}

    </div>

  );

}

export default function MyStoriesPage() {
  return (
    <Suspense
      fallback={
        <section className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-5 text-sm text-gray-600">Loading your published stories...</p>
        </section>
      }
    >
      <MyStoriesContent />
    </Suspense>
  );
      }
      
