"use client";

import StoryEditor from "./components/StoryEditor";
import CategorySelector from "./components/CategorySelector";
import CoverImageUpload from "./components/CoverImageUpload";
import StoryImages from "./components/StoryImages";
import StoryTags from "./components/StoryTags";
import StoryActions from "./components/StoryActions";
import { StoryFormProvider } from "./components/StoryFormContext";

export default function WriteStoryPage() {
  return (
    <StoryFormProvider>

      <div className="space-y-8">

        {/* Page Header */}

        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">

          <h1 className="text-3xl font-bold">
            Write a Story
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            Every parenting journey is unique. Share your
            experience to educate, inspire and support
            parents around the world.
          </p>

        </section>

        {/* Story Details */}

        <StoryEditor />

        {/* Category */}

        <CategorySelector />

        {/* Cover Image */}

        <CoverImageUpload />

        {/* Story Images */}

        <StoryImages />

        {/* Story Tags */}

        <StoryTags />

        {/* Publish Buttons */}

        <StoryActions />

      </div>

    </StoryFormProvider>
  );
            }
