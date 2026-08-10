"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  storyId: string;
  initiallyBookmarked: boolean;
};

export default function BookmarkButton({
  storyId,
  initiallyBookmarked,
}: Props) {
  const router = useRouter();

  const [isBookmarked, setIsBookmarked] =
    useState(initiallyBookmarked);

  const [loading, setLoading] =
    useState(false);

  async function handleBookmark() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "/api/bookmarks",
        {
          method: isBookmarked
            ? "DELETE"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            storyId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update bookmark."
        );
      }

      setIsBookmarked(
        !isBookmarked
      );

      router.refresh();

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
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBookmark}
      disabled={loading}
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
        isBookmarked
          ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading
        ? "Please wait..."
        : isBookmarked
        ? "🗑️ Delete Bookmark"
        : "🔖 Bookmark Story"}
    </button>
  );
    }
