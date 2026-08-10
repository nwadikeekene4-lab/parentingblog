"use client";

import { useState } from "react";

type BookmarkButtonProps = {
  storyId: string;
  initiallyBookmarked: boolean;
};

export default function BookmarkButton({
  storyId,
  initiallyBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(
    initiallyBookmarked
  );

  const [loading, setLoading] = useState(false);

  async function handleBookmark() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/bookmarks", {
        method: bookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Failed to update bookmark."
        );
      }

      setBookmarked(!bookmarked);
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
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
        bookmarked
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      } ${
        loading
          ? "cursor-not-allowed opacity-60"
          : ""
      }`}
    >
      {loading
        ? "Saving..."
        : bookmarked
        ? "🔖 Bookmarked"
        : "🔖 Bookmark"}
    </button>
  );
}
