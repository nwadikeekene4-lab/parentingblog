"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type MyStoryCardProps = {
  id: string;
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
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nYou can restore it later from the admin panel.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      // Backend integration will come later
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

      {/* Story Image */}

      <div className="relative h-52 overflow-hidden">

        <Image
          src={image}
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

          <span>👁 {views}</span>

          <span>❤️ {likes}</span>

          <span>💬 {comments}</span>

          <span>🔖 {bookmarks}</span>

        </div>

        {/* Action Buttons */}

        <div className="flex flex-wrap gap-3">

          <Link
            href={`/stories/${id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View
          </Link>

          <Link
            href={`/users-dashboard/write-story?id=${id}`}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </article>
  );
    }
