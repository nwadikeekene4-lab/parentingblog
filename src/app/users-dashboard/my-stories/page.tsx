"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MyStoryCard from "@/app/components/dashboard/MyStoryCard";

const stories = [
  {
    id: "1",
    title: "My Journey Through Pregnancy",
    category: "Pregnancy",
    image: "/Images/stories/story1.jpg",
    views: 245,
    likes: 52,
    comments: 14,
    bookmarks: 18,
    featured: true,
  },
  {
    id: "2",
    title: "How I Survived the Newborn Stage",
    category: "Newborn",
    image: "/Images/stories/story2.jpg",
    views: 180,
    likes: 34,
    comments: 9,
    bookmarks: 11,
    featured: false,
  },
];

export default function MyStoriesPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");

  const filteredStories = useMemo(() => {
    let filtered = stories.filter((story) =>
      story.title.toLowerCase().includes(search.toLowerCase())
    );

    switch (sortBy) {
      case "Oldest":
        filtered = [...filtered].reverse();
        break;

      case "Most Viewed":
        filtered = [...filtered].sort(
          (a, b) => b.views - a.views
        );
        break;

      case "Featured":
        filtered = filtered.filter(
          (story) => story.featured
        );
        break;

      default:
        break;
    }

    return filtered;
  }, [search, sortBy]);

  return (
    <div className="space-y-8">

      {/* Header */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            My Stories
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage all your published parenting stories.
          </p>

        </div>

        <Link
          href="/users-dashboard/write-story"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Write Story
        </Link>

      </section>

      {/* Search & Filters */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <input
          type="text"
          placeholder="Search your stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:max-w-md"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm"
        >
          <option>Newest</option>
          <option>Oldest</option>
          <option>Most Viewed</option>
          <option>Featured</option>
        </select>

      </section>

      {/* Stories */}

      {filteredStories.length > 0 ? (

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredStories.map((story) => (

            <MyStoryCard
              key={story.id}
              id={story.id}
              title={story.title}
              category={story.category}
              image={story.image}
              views={story.views}
              likes={story.likes}
              comments={story.comments}
              bookmarks={story.bookmarks}
              featured={story.featured}
            />

          ))}

        </section>

      ) : (

        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">

          <div className="text-6xl">
            📚
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-gray-900">

            {search
              ? "No matching stories found"
              : "No published stories yet"}

          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">

            {search
              ? "Try another search keyword."
              : "Start sharing your parenting journey by writing your first story."}

          </p>

          {!search && (

            <Link
              href="/users-dashboard/write-story"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Write Your First Story
            </Link>

          )}

        </section>

      )}

    </div>
  );
    }
