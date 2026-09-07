"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type MyStoryCardProps = {
id: string;
slug: string;
title: string;
category: string;
image: string;
views: number;
likes: number;
comments: number;
bookmarks: number;
publishedAt?: string;
featured?: boolean;
};

export default function MyStoryCard({
id,
slug,
title,
category,
image,
views,
likes,
comments,
bookmarks,
publishedAt = "July 2026",
featured = false,
}: MyStoryCardProps) {
const [isDeleting, setIsDeleting] =
useState(false);

const [showDeleteDialog, setShowDeleteDialog] =
useState(false);

async function handleDelete() {
try {
setIsDeleting(true);

  const response = await fetch(
    `/api/stories/${id}`,
    {
      method: "DELETE",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Failed to delete story."
    );
  }

  window.location.reload();

} catch (error) {

  console.error(
    "Delete story error:",
    error
  );

  alert(
    error instanceof Error
      ? error.message
      : "Something went wrong."
  );

} finally {

  setIsDeleting(false);
  setShowDeleteDialog(false);

}

}

return (
<>
<article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

    {/* Story Image */}

    <div className="relative h-52 overflow-hidden">

      <Image
        src={
          image ||
          "/images/loginimage.png"
        }
        alt={title}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      {featured && (
        <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-gray-900 shadow">
          ⭐ Featured
        </span>
      )}

    </div>

    {/* Content */}

    <div className="space-y-5 p-5">

      <div>

        <p className="text-sm font-semibold text-blue-600">
          {category}
        </p>

        <h2 className="mt-2 line-clamp-2 text-xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-2 text-xs text-gray-500">
          Published • {publishedAt}
        </p>

      </div>

      {/* Stats */}

      <div className="flex flex-wrap gap-4 text-sm text-gray-500">

        <span>
          👁 {views}
        </span>

        <span>
          ❤️ {likes}
        </span>

        <span>
          💬 {comments}
        </span>

        <span>
          🔖 {bookmarks}
        </span>

      </div>

      {/* Action Buttons */}

      <div className="flex flex-wrap gap-3">

        <Link
          href={`/stories/${slug}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          View
        </Link>

        {/* Published stories must enter published-edit mode */}
        <Link
          href={`/users-dashboard/drafts/${id}?mode=published`}
          className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={() =>
            setShowDeleteDialog(true)
          }
          disabled={isDeleting}
          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting
            ? "Deleting..."
            : "Delete"}
        </button>

      </div>

    </div>

  </article>

  {/* Delete Confirmation Dialog */}

  {showDeleteDialog && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <h2 className="text-xl font-bold text-gray-900">
          Delete Story?
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Are you sure you want to delete{" "}
          <strong className="text-gray-900">
            "{title}"
          </strong>
          ?
        </p>

        <p className="mt-2 text-sm text-gray-500">
          This story will no longer appear in
          your published stories.
        </p>

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              setShowDeleteDialog(false)
            }
            disabled={isDeleting}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Story"}
          </button>

        </div>

      </div>

    </div>
  )}

</>

);
  }
