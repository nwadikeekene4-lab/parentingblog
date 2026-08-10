"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MyStoryCard from "@/app/components/dashboard/MyStoryCard";

type Story = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: string;
};

export default function MyStoriesPage() {

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


  useEffect(() => {

    async function loadStories() {

      try {

        setLoading(true);
        setError("");

        const response =
          await fetch("/api/stories");

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

          // View statistics will be
          // connected separately.

          break;


        case "Featured":

          // Featured status will be
          // connected when the story
          // featured field is added
          // to this API response.

          break;


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
          className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm"
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
            (story) => (

            <MyStoryCard
              key={story.id}

              id={story.slug}
              slug={story.slug}
              

              title={story.title}

              category={
                story.category
              }

              image={
                story.coverImage ??
                "/images/loginimage.png"
              }

              views={0}

              likes={0}

              comments={0}

              bookmarks={0}

              publishedAt={
                story.publishedAt
                  ? new Date(
                      story.publishedAt
                    ).toLocaleDateString()
                  : new Date(
                      story.createdAt
                    ).toLocaleDateString()
              }

              featured={false}

            />

          ))}

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
