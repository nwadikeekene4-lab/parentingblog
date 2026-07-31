"use client";

import { useState } from "react";
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

        {/* Search */}

        <div className="w-full lg:max-w-sm">

          <input
            type="text"
            placeholder="Search your stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

        </div>

      </section>

      {/* Filters */}

      <section className="flex flex-col gap-4 sm:flex-row">

        <select className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm">

          <option>Newest</option>

          <option>Oldest</option>

          <option>Most Viewed</option>

          <option>Featured</option>

        </select>

      </section>

      {/* Stories Grid */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {stories.map((story) => (
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

    </div>
  );
          }
