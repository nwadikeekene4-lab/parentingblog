"use client";

import { useState } from "react";

const suggestedTags = [
  "First Pregnancy",
  "Newborn Care",
  "Breastfeeding",
  "Sleep Training",
  "Toddler Development",
  "Teen Challenges",
  "Single Mother",
  "Single Father",
  "Family Support",
  "Success Story",
  "Adoption",
  "Special Needs",
  "Education",
  "Health",
  "Nutrition",
  "Working Parents",
];

export default function StoryTags() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function addTag(tag: string) {
    const value = tag.trim();

    if (
      value === "" ||
      selectedTags.includes(value) ||
      selectedTags.length >= 5
    ) {
      return;
    }

    setSelectedTags([...selectedTags, value]);
  }

  function removeTag(tag: string) {
    setSelectedTags(
      selectedTags.filter((t) => t !== tag)
    );
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();

      addTag(tagInput);

      setTagInput("");
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-900">
          Story Tags
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Optional)
          </span>
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Tags help other parents discover your story.
          Add a few words or short phrases that describe
          your experience. You can create your own tags
          or choose from the suggestions below.
        </p>

      </div>

      {/* Input */}

      <div className="flex flex-col gap-3 sm:flex-row">

        <input
          type="text"
          value={tagInput}
          onChange={(e) =>
            setTagInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Example: First Pregnancy"
          className="h-12 flex-1 rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={() => {
            addTag(tagInput);
            setTagInput("");
          }}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Add Tag
        </button>

      </div>

      {/* Counter */}

      <p className="mt-4 text-sm text-gray-500">
        {selectedTags.length} / 5 tags selected
      </p>

      {/* Selected */}

      {selectedTags.length > 0 && (

        <div className="mt-5 flex flex-wrap gap-3">

          {selectedTags.map((tag) => (

            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-red-100 hover:text-red-600"
            >
              {tag} ✕
            </button>

          ))}

        </div>

      )}

      {/* Suggestions */}

      <div className="mt-8">

        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Suggested Tags
        </h3>

        <div className="flex flex-wrap gap-3">

          {suggestedTags.map((tag) => (

            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              disabled={selectedTags.includes(tag)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedTags.includes(tag)
                  ? "cursor-not-allowed bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tag}
            </button>

          ))}

        </div>

      </div>

    </section>
  );
}
