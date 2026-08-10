"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BookmarkButtonProps = {
  storyId: string;
  storySlug: string;
};

export default function BookmarkButton({
  storyId,
  storySlug,
}: BookmarkButtonProps) {

  const router = useRouter();

  const [bookmarked, setBookmarked] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [authenticated, setAuthenticated] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Check whether the current user has bookmarked this story
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let cancelled = false;

    async function checkBookmark() {

      try {

        setLoading(true);

        const response =
          await fetch(
            "/api/bookmarks",
            {
              method: "GET",
              cache: "no-store",
            }
          );


        /*
        |--------------------------------------------------------------------------
        | Visitor is not logged in
        |--------------------------------------------------------------------------
        */

        if (response.status === 401) {

          if (!cancelled) {

            setAuthenticated(false);
            setBookmarked(false);

          }

          return;
        }


        if (!response.ok) {
          return;
        }


        const data =
          await response.json();


        if (cancelled) {
          return;
        }


        setAuthenticated(true);


        const exists =
          Array.isArray(data.bookmarks) &&
          data.bookmarks.some(
            (bookmark: {
              story?: {
                id?: string;
              };
            }) =>
              bookmark.story?.id === storyId
          );


        setBookmarked(
          Boolean(exists)
        );


      } catch (error) {

        if (!cancelled) {

          console.error(
            "Check bookmark error:",
            error
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }


    checkBookmark();


    return () => {
      cancelled = true;
    };

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


    /*
    |--------------------------------------------------------------------------
    | Visitor protection
    |--------------------------------------------------------------------------
    */

    if (!authenticated) {

      router.push(
        `/login?redirect=${encodeURIComponent(
          `/stories/${storySlug}`
        )}`
      );

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


      /*
      |--------------------------------------------------------------------------
      | Session expired
      |--------------------------------------------------------------------------
      */

      if (response.status === 401) {

        setAuthenticated(false);
        setBookmarked(false);

        router.push(
          `/login?redirect=${encodeURIComponent(
            `/stories/${storySlug}`
          )}`
        );

        return;
      }


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ??
            "Unable to update bookmark."
        );

      }


      /*
      |--------------------------------------------------------------------------
      | Update UI immediately
      |--------------------------------------------------------------------------
      */

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
        !authenticated
          ? "Log in to bookmark story"
          : bookmarked
          ? "Remove bookmark"
          : "Bookmark story"
      }
      title={
        !authenticated
          ? "Log in to bookmark this story"
          : bookmarked
          ? "Remove bookmark"
          : "Bookmark this story"
      }
      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
        bookmarked
          ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >

      <span className="text-lg">
        🔖
      </span>

      {loading
        ? "Checking..."
        : saving
        ? "Saving..."
        : !authenticated
        ? "Login to Bookmark"
        : bookmarked
        ? "Bookmarked"
        : "Bookmark"}

    </button>

  );
      }
