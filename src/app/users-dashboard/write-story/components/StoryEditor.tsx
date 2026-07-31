"use client";

import { useState } from "react";

export default function StoryEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const wordCount =
    content.trim() === ""
      ? 0
      : content.trim().split(/\s+/).length;

  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">

      {/* Heading */}

      <div>

        <h2 className="text-2xl font-bold text-gray-900">
          Story Details
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Share your parenting experience with the community.
        </p>

      </div>

      {/* Story Title */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Story Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Enter your story title..."
          maxLength={150}
          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <p className="mt-2 text-xs text-gray-500">
          {title.length}/150 characters
        </p>

      </div>

      {/* Story Content */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Story Content
        </label>

        <textarea
          rows={16}
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          placeholder="Start writing your parenting story..."
          className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

      </div>

      {/* Footer */}

      <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:justify-between">

        <span>
          Words: {wordCount}
        </span>

        <span>
          Characters: {content.length}
        </span>

      </div>

    </section>
  );
      }
