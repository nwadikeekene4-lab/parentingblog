"use client";

import { useState } from "react";

export default function BookmarksPage() {
  const [search, setSearch] = useState("");

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

        <div className="w-full lg:max-w-sm">

          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

        </div>

      </section>

      {/* Filter */}

      <section className="flex flex-col gap-4 sm:flex-row">

        <select className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm">

          <option>Recently Saved</option>

          <option>Oldest Saved</option>

          <option>Most Popular</option>

          <option>Category</option>

        </select>

      </section>

      {/* Empty State */}

      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">

        <div className="text-6xl">
          🔖
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-gray-900">
          No bookmarked stories yet
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">
          Save parenting stories you enjoy so you can easily
          return to them anytime.
        </p>

        <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
          Browse Stories
        </button>

      </section>

    </div>
  );
      }
