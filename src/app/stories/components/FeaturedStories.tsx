"use client";

import { useEffect, useState } from "react";
import StoryPreviewCard from "./StoryPreviewCard";

type FeaturedStory = {
  id: string;
  slug: string;
  image: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  readTime: string;
  publishedAt: string | null;
};

export default function FeaturedStories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredStories, setFeaturedStories] =
    useState<FeaturedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFeaturedStories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/stories/featured",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ??
              "Unable to load featured stories."
          );
        }

        setFeaturedStories(data.stories ?? []);
      } catch (error) {
        console.error(
          "Featured stories error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load featured stories."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedStories();
  }, []);

  const cleanText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const search = cleanText(searchTerm);

  const filteredStories =
    featuredStories.filter((story) => {
      const searchableContent = cleanText(
        `${story.title}
         ${story.category}
         ${story.excerpt}
         ${story.author}
         ${story.readTime}`
      );

      return searchableContent.includes(search);
    });

  return (
    <section
      className="
        mb-8
        overflow-hidden
        rounded-[28px]
        border
        border-[#f0dce4]
        bg-white
        px-4
        py-8
        shadow-[0_8px_30px_rgba(76,42,56,0.06)]

        sm:rounded-[32px]
        sm:px-8
        sm:py-10

        md:px-10
        md:py-14

        lg:px-12
        lg:py-16
      "
    >
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="
            inline-flex
            rounded-full
            bg-[#fff0f5]
            px-3.5
            py-1.5
            text-xs
            font-bold
            uppercase
            tracking-[0.12em]
            text-[#b52e5d]
          "
        >
          Featured
        </span>

        <h2
          className="
            mt-3
            text-3xl
            font-extrabold
            tracking-tight
            text-[#35232d]

            sm:text-4xl
          "
        >
          Featured Stories
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-[#735f68]

            sm:mt-4
            sm:text-lg
            sm:leading-8
          "
        >
          Explore inspiring parenting stories carefully
          selected to educate, encourage and connect
          families around the world.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto mt-6 max-w-xl sm:mt-8">
        <div className="relative">
          <svg
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#a78391]
            "
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <input
            type="text"
            placeholder="Search featured stories..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="
              w-full
              rounded-2xl
              border
              border-[#ead7e0]
              bg-[#fffafd]
              py-3.5
              pl-12
              pr-4
              text-sm
              text-[#4a3540]
              shadow-[0_4px_16px_rgba(76,42,56,0.04)]
              outline-none
              transition-all
              duration-200
              placeholder:text-[#aa929d]
              focus:border-[#d94f7b]
              focus:bg-white
              focus:ring-4
              focus:ring-[#d94f7b]/10

              sm:rounded-full
              sm:py-4
              sm:pr-6
              sm:text-base
            "
            aria-label="Search featured stories"
          />
        </div>
      </div>

      {/* Stories */}
      <div
        className="
          mt-7
          grid
          grid-cols-1
          gap-5

          sm:mt-9
          sm:gap-6

          md:grid-cols-2

          xl:grid-cols-3
        "
      >
        {/* Loading */}
        {loading && (
          <div className="col-span-full py-12 text-center sm:py-16">
            <div
              className="
                mx-auto
                h-9
                w-9
                animate-spin
                rounded-full
                border-4
                border-[#f2dce5]
                border-t-[#c93668]
              "
              aria-hidden="true"
            />

            <p className="mt-4 text-sm text-[#735f68]">
              Loading featured stories...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="
              col-span-full
              rounded-2xl
              border
              border-red-100
              bg-red-50
              px-5
              py-10
              text-center
            "
          >
            <div className="text-3xl">⚠️</div>

            <h3 className="mt-3 text-lg font-bold text-[#35232d]">
              Unable to load featured stories
            </h3>

            <p className="mt-2 text-sm text-[#735f68]">
              {error}
            </p>
          </div>
        )}

        {/* No stories */}
        {!loading &&
          !error &&
          filteredStories.length === 0 && (
            <p
              className="
                col-span-full
                py-10
                text-center
                text-sm
                text-[#735f68]
              "
            >
              {featuredStories.length === 0
                ? "There are no featured stories available yet."
                : "No featured stories found. Try another search."}
            </p>
          )}

        {/* Story Cards */}
        {!loading &&
          !error &&
          filteredStories.length > 0 &&
          filteredStories.map((story) => (
            <StoryPreviewCard
              key={story.id}
              storyId={story.id}
              slug={story.slug}
              image={story.image}
              title={story.title}
              category={story.category}
              excerpt={story.excerpt}
              author={story.author}
              readTime={story.readTime}
            />
          ))}
      </div>
    </section>
  );
}

