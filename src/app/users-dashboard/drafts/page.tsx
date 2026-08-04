"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


type Draft = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};



export default function DraftsPage() {

  const [search, setSearch] =
    useState("");

  const [drafts, setDrafts] =
    useState<Draft[]>([]);

  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    async function loadDrafts() {

      try {

        const response =
          await fetch(
            "/api/drafts"
          );


        const data =
          await response.json();


        if (response.ok) {

          setDrafts(
            data.drafts
          );

        }


      } catch (error) {

        console.error(
          "Failed to fetch drafts:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadDrafts();

  }, []);




  const filteredDrafts =
    drafts.filter((draft) =>
      draft.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );



  return (
    <div className="space-y-8">


      {/* Header */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Draft Stories
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Continue writing and editing your unpublished stories.
          </p>

        </div>


        <div className="w-full lg:max-w-sm">

          <input
            type="text"
            placeholder="Search drafts..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

        </div>

      </section>



      {/* Filter */}

      <section className="flex flex-col gap-4 sm:flex-row">

        <select className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm">

          <option>
            Recently Edited
          </option>

          <option>
            Oldest Draft
          </option>

          <option>
            A–Z
          </option>

          <option>
            Z–A
          </option>

        </select>

      </section>




      {loading && (

        <section className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <p className="text-gray-600">
            Loading drafts...
          </p>

        </section>

      )}




      {!loading &&
        filteredDrafts.length === 0 && (

        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📝
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            No draft stories
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">
            Your unfinished stories will appear here automatically
            after you save them as drafts.
          </p>


          <Link
            href="/users-dashboard/write-story"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Write a Story
          </Link>

        </section>

      )}




      {!loading &&
        filteredDrafts.length > 0 && (

        <section className="grid gap-6 md:grid-cols-2">


          {filteredDrafts.map((draft) => (

            <article
              key={draft.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >

              {draft.coverImage && (

                <img
                  src={draft.coverImage}
                  alt={draft.title}
                  className="h-48 w-full object-cover"
                />

              )}



              <div className="p-6">

                <p className="text-sm font-medium text-blue-600">
                  {draft.category}
                </p>


                <h2 className="mt-2 text-xl font-bold text-gray-900">
                  {draft.title}
                </h2>


                <p className="mt-3 text-sm text-gray-600">
                  {draft.excerpt}
                </p>


                <p className="mt-4 text-xs text-gray-500">
                  Last edited:
                  {" "}
                  {new Date(
                    draft.updatedAt
                  ).toLocaleDateString()}
                </p>


              </div>

            </article>

          ))}


        </section>

      )}



    </div>
  );

}
