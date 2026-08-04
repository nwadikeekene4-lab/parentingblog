"use client";

import { useStoryForm } from "./StoryFormContext";

const MAX_TITLE = 150;
const MAX_WORDS = 2500;

export default function StoryEditor() {
  const {
    title,
    setTitle,
    content,
    setContent,
  } = useStoryForm();

  const words =
    content.trim() === ""
      ? []
      : content.trim().split(/\s+/);

  const wordCount = words.length;

  const progress = Math.min(
    (wordCount / MAX_WORDS) * 100,
    100
  );

  function handleContentChange(
    value: string
  ) {
    const splitWords =
      value.trim() === ""
        ? []
        : value.trim().split(/\s+/);

    if (splitWords.length <= MAX_WORDS) {
      setContent(value);
    }
  }

  return (
    <section className="space-y-8 rounded-2xl bg-white p-6 shadow-sm">

      <div>

        <h2 className="text-2xl font-bold text-gray-900">
          Story Details
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Fields marked with
          <span className="font-semibold text-red-600">
            {" "}*
          </span>
          {" "}are required.
        </p>

      </div>

      {/* Story Title */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Story Title
          <span className="text-red-600">
            {" "}*
          </span>
        </label>

        <input
          type="text"
          value={title}
          maxLength={MAX_TITLE}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Example: My Journey Raising Twins"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <div className="mt-2 flex justify-between text-xs text-gray-500">

          <span>
            Maximum {MAX_TITLE} characters
          </span>

          <span>
            {title.length}/{MAX_TITLE}
          </span>

        </div>

      </div>

      {/* Story Content */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Story Content
          <span className="text-red-600">
            {" "}*
          </span>
        </label>

        <textarea
          rows={18}
          value={content}
          onChange={(e) =>
            handleContentChange(
              e.target.value
            )
          }
          placeholder="Write your parenting experience here..."
          className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <div className="mt-4">

          <div className="mb-2 flex justify-between text-sm">

            <span className="font-medium text-gray-700">
              Word Count
            </span>

            <span
              className={
                wordCount >= MAX_WORDS
                  ? "font-semibold text-red-600"
                  : "text-gray-600"
              }
            >
              {wordCount}/{MAX_WORDS}
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          {wordCount >= 2200 &&
            wordCount < MAX_WORDS && (

            <p className="mt-3 text-sm text-amber-600">
              You are approaching the maximum
              word limit.
            </p>

          )}

          {wordCount >= MAX_WORDS && (

            <p className="mt-3 font-medium text-red-600">
              Maximum word count reached.
            </p>

          )}

        </div>

      </div>

      <div className="flex flex-wrap justify-between gap-3 rounded-xl bg-gray-50 p-4 text-sm">

        <span>
          Words:{" "}
          <strong>{wordCount}</strong>
        </span>

        <span>
          Characters:{" "}
          <strong>{content.length}</strong>
        </span>

      </div>

    </section>
  );
      }
