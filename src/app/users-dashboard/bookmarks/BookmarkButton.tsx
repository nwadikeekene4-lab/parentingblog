"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  storyId: string;
};

export default function BookmarkButton({
  storyId,
}: Props) {
  const router = useRouter();

  const [deleting, setDeleting] =
    useState(false);

  async function deleteBookmark() {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this bookmark?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(
        "/api/bookmarks",
        {
          method: "DELETE",

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
            "Failed to delete bookmark."
        );
      }

      router.refresh();

    } catch (error) {
      console.error(
        "Delete bookmark error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={deleteBookmark}
      disabled={deleting}
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {deleting
        ? "Deleting..."
        : "🗑️ Delete Bookmark"}
    </button>
  );
  }
