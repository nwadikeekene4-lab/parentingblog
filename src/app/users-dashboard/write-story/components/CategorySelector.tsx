"use client";

import { useState } from "react";

const categories = [
  "Pregnancy",
  "Newborn",
  "Toddlers",
  "Teenagers",
  "Single Moms",
  "Single Dads",
  "Success Stories",
];

export default function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-xl font-bold text-gray-900">
          Category
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Choose the category that best describes your story.
        </p>

      </div>

      <select
        value={selectedCategory}
        onChange={(e) =>
          setSelectedCategory(e.target.value)
        }
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >

        <option value="">
          Select a category
        </option>

        {categories.map((category) => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}

      </select>

      {selectedCategory && (

        <div className="mt-4 rounded-xl bg-blue-50 p-4">

          <p className="text-sm font-medium text-blue-700">

            Selected Category:

            <span className="ml-2 font-bold">

              {selectedCategory}

            </span>

          </p>

        </div>

      )}

    </section>
  );
}
