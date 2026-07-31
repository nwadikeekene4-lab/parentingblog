
"use client";

import { useState } from "react";

const availableTags = [
  "Pregnancy",
  "Newborn",
  "Toddlers",
  "Teenagers",
  "Single Moms",
  "Single Dads",
  "Parenting Tips",
  "Mental Health",
  "Education",
  "Family",
  "Success Story",
  "Nutrition",
];

export default function StoryTags() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-xl font-bold text-gray-900">
          Story Tags
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Select tags to help readers discover your story.
        </p>

      </div>

      <div className="flex flex-wrap gap-3">

        {availableTags.map((tag) => {

          const selected = selectedTags.includes(tag);

          return (

            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tag}
            </button>

          );

        })}

      </div>

      <div className="mt-6">

        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Selected Tags
        </h3>

        {selectedTags.length === 0 ? (

          <p className="text-sm text-gray-500">
            No tags selected.
          </p>

        ) : (

          <div className="flex flex-wrap gap-2">

            {selectedTags.map((tag) => (

              <span
                key={tag}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {tag}
              </span>

            ))}

          </div>

        )}

      </div>

    </section>
  );
                }
