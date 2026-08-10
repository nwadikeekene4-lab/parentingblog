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
  const [searchTerm, setSearchTerm] =
    useState("");

  const [featuredStories, setFeaturedStories] =
    useState<FeaturedStory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Fetch featured stories
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchFeaturedStories() {

      try {

        setLoading(true);

        setError("");

        const response =
          await fetch(
            "/api/stories/featured",
            {
              method: "GET",
              cache: "no-store",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ??
              "Unable to load featured stories."
          );

        }


        setFeaturedStories(
          data.stories ?? []
        );


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


  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const cleanText = (
    text: string
  ) =>
    text
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        ""
      )
      .trim();


  const filteredStories =
    featuredStories.filter(
      (story) => {

        const searchableContent =
          cleanText(
            `${story.title}
             ${story.category}
             ${story.excerpt}
             ${story.author}
             ${story.readTime}`
          );


        const search =
          cleanText(
            searchTerm
          );


        return searchableContent.includes(
          search
        );

      }
    );


  return (
    <section className="mt-2 rounded-[36px] bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 px-5 py-10 shadow-lg sm:px-8 md:px-10 md:py-14 lg:px-12 lg:py-16">

      {/* Header */}

      <div className="mx-auto max-w-3xl text-center">

        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Featured Stories
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          Explore inspiring parenting stories carefully selected to educate,
          encourage and connect families around the world. Every featured
          story offers meaningful lessons and authentic experiences.
        </p>

      </div>


      {/* Search Bar */}

      <div className="mx-auto mt-8 max-w-xl">

        <div className="relative">

          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            <path
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
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
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full rounded-full border border-stone-300 bg-white py-4 pl-14 pr-6 text-slate-700 shadow-md outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />

        </div>

      </div>


      {/* Stories */}

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">

        {/* Loading */}

        {loading && (

          <div className="col-span-full py-16 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

            <p className="mt-5 text-slate-600">
              Loading featured stories...
            </p>

          </div>

        )}


        {/* Error */}

        {!loading &&
          error && (

            <div className="col-span-full rounded-3xl border border-red-200 bg-white px-6 py-12 text-center">

              <div className="text-4xl">
                ⚠️
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Unable to load featured stories
              </h3>

              <p className="mt-2 text-slate-600">
                {error}
              </p>

            </div>

          )}


        {/* No stories */}

        {!loading &&
          !error &&
          filteredStories.length ===
            0 && (

            <p className="col-span-full mt-5 text-center text-slate-600">
              {featuredStories.length ===
              0
                ? "There are no featured stories available yet."
                : "No featured stories found. Try another search."}
            </p>

          )}


        {/* Story Cards */}

        {!loading &&
          !error &&
          filteredStories.length >
            0 &&

          filteredStories.map(
            (story) => (

              <StoryPreviewCard
                key={story.id}

                storyId={
                  story.id
                }

                image={
                  story.image
                }

                title={
                  story.title
                }

                category={
                  story.category
                }

                excerpt={
                  story.excerpt
                }

                author={
                  story.author
                }

                readTime={
                  story.readTime
                }
              />

            )
          )}

      </div>

    </section>
  );
      }
