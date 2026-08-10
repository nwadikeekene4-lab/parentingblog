"use client";

import { useEffect, useState } from "react";

type BookmarkButtonProps = {
  storyId: string;
};

export default function BookmarkButton({
  storyId,
}: BookmarkButtonProps) {

  const [bookmarked, setBookmarked] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Check whether this story is already bookmarked
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function checkBookmark() {

      try {

        const response =
          await fetch(
            "/api/bookmarks",
            {
              method: "GET",
              cache: "no-store",
            }
          );


        if (!response.ok) {
          return;
        }


        const data =
          await response.json();


        const exists =
          data.bookmarks?.some(
            (bookmark: {
              story: {
                id: string;
              };
            }) =>
              bookmark.story.id === storyId
          );


        setBookmarked(
          Boolean(exists)
        );

      } catch (error) {

        console.error(
          "Check bookmark error:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    checkBookmark();

  }, [storyId]);


  /*
  |--------------------------------------------------------------------------
  | Add / remove bookmark
  |--------------------------------------------------------------------------
  */

  async function handleBookmark() {

    if (saving) {
      return;
    }


    try {

      setSaving(true);


      const response =
        await fetch(
          "/api/bookmarks",
          {

            method:
              bookmarked
                ? "DELETE"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                storyId,
              }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ??
            "Unable to update bookmark."
        );

      }


      setBookmarked(
        !bookmarked
      );


    } catch (error) {

      console.error(
        "Bookmark error:",
        error
      );


      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setSaving(false);

    }

  }


  return (

    <button
      type="button"
      onClick={handleBookmark}
      disabled={
        loading ||
        saving
      }
      aria-label={
        bookmarked
          ? "Remove bookmark"
          : "Bookmark story"
      }
      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
        bookmarked
          ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >

      <span className="text-lg">
        {bookmarked
          ? "🔖"
          : "🔖"}
      </span>

      {loading
        ? "Checking..."
        : bookmarked
        ? "Bookmarked"
        : "Bookmark"}

    </button>

  );

    }
