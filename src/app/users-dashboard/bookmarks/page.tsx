"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookmarkCard from "./BookmarkCard";


type Bookmark = {
  bookmarkId: string;
  bookmarkedAt: string;

  story: {
    id: string;
    title: string;
    slug: string;
    content: string;

    coverImage: string | null;

    featured: boolean;

    views: number;
    likes: number;
    comments: number;
    bookmarkCount: number;

    publishedAt: string | null;

    author: {
      displayName: string;
      profileImage: string | null;
    };

    category: {
      name: string;
    };

    images: {
      id: string;
      imageUrl: string;
      caption: string | null;
      displayOrder: number;
    }[];
  };
};


export default function BookmarksPage() {

  const [bookmarks, setBookmarks] =
    useState<Bookmark[]>([]);

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("Recently Saved");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Load bookmarks
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function loadBookmarks() {

      try {

        const response =
          await fetch(
            "/api/bookmarks",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ??
              "Failed to load bookmarks."
          );
        }

        setBookmarks(
          data.bookmarks ?? []
        );

      } catch (error) {

        console.error(
          "Load bookmarks error:",
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

    loadBookmarks();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Remove bookmark
  |--------------------------------------------------------------------------
  */

  async function removeBookmark(
    storyId: string
  ) {

    try {

      const response =
        await fetch(
          `/api/bookmarks/${storyId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to remove bookmark."
        );
      }

      setBookmarks(
        (current) =>
          current.filter(
            (bookmark) =>
              bookmark.story.id !== storyId
          )
      );

    } catch (error) {

      console.error(
        "Remove bookmark error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Search + sorting
  |--------------------------------------------------------------------------
  */

  const filteredBookmarks =
    useMemo(() => {

      const result =
        bookmarks.filter(
          (bookmark) => {

            const story =
              bookmark.story;

            const term =
              search.toLowerCase();

            return (
              story.title
                .toLowerCase()
                .includes(term) ||

              story.author.displayName
                .toLowerCase()
                .includes(term) ||

              story.category.name
                .toLowerCase()
                .includes(term)
            );

          }
        );


      return [...result].sort(
        (a, b) => {

          if (
            sortBy ===
            "Oldest Saved"
          ) {
            return (
              new Date(
                a.bookmarkedAt
              ).getTime() -
              new Date(
                b.bookmarkedAt
              ).getTime()
            );
          }


          if (
            sortBy ===
            "Most Popular"
          ) {
            return (
              b.story.views -
              a.story.views
            );
          }


          if (
            sortBy ===
            "Category"
          ) {
            return a.story.category.name.localeCompare(
              b.story.category.name
            );
          }


          return (
            new Date(
              b.bookmarkedAt
            ).getTime() -
            new Date(
              a.bookmarkedAt
            ).getTime()
          );

        }
      );

    }, [
      bookmarks,
      search,
      sortBy,
    ]);


  return (

    <div className="space-y-8">


      {/* Header */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Bookmarked Stories
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Easily find the parenting stories you've saved to read later.
          </p>

        </div>


        <input
          type="text"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:max-w-sm"
        />

      </section>


      {/* Filter */}

      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
        className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm"
      >

        <option>
          Recently Saved
        </option>

        <option>
          Oldest Saved
        </option>

        <option>
          Most Popular
        </option>

        <option>
          Category
        </option>

      </select>


      {/* Loading */}

      {loading && (

        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-600">
            Loading your bookmarks...
          </p>

        </div>

      )}


      {/* Error */}

      {!loading && error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <h2 className="text-xl font-semibold text-red-900">
            Unable to load bookmarks
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>

        </div>

      )}


      {/* Bookmark cards */}

      {!loading &&
        !error &&
        filteredBookmarks.length > 0 && (

        <section className="grid gap-6 lg:grid-cols-2">

          {filteredBookmarks.map(
            (bookmark) => (

              <BookmarkCard
                key={
                  bookmark.bookmarkId
                }
                bookmarkId={
                  bookmark.bookmarkId
                }
                bookmarkedAt={
                  bookmark.bookmarkedAt
                }
                story={
                  bookmark.story
                }
                onRemove={
                  removeBookmark
                }
              />

            )
          )}

        </section>

      )}


      {/* Empty state */}

      {!loading &&
        !error &&
        filteredBookmarks.length === 0 && (

        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            🔖
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-gray-900">

            {search
              ? "No matching bookmarks found"
              : "No bookmarked stories yet"}

          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm text-gray-600">

            {search
              ? "Try another search keyword."
              : "Save parenting stories you enjoy so you can easily return to them later."}

          </p>

          {!search && (

            <Link
              href="/stories"
              className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse Stories
            </Link>

          )}

        </section>

      )}

    </div>

  );

}
