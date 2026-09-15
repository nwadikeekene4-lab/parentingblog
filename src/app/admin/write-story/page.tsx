"use client";

import { Suspense } from "react";

import StoryEditor from "@/app/users-dashboard/write-story/components/StoryEditor";
import CategorySelector from "@/app/users-dashboard/write-story/components/CategorySelector";
import CoverImageUpload from "@/app/users-dashboard/write-story/components/CoverImageUpload";
import StoryImages from "@/app/users-dashboard/write-story/components/StoryImages";
import StoryActions from "@/app/users-dashboard/write-story/components/StoryActions";

import {
  StoryFormProvider,
} from "@/app/users-dashboard/write-story/components/StoryFormContext";

function AdminWriteStoryContent() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Write a Story
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100">
          Create a new parenting story from the administrator
          dashboard.
        </p>
      </section>

      <StoryEditor />

      <CategorySelector />

      <CoverImageUpload />

      <StoryImages />

      <StoryActions />
    </div>
  );
}

export default function AdminWriteStoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          Loading story editor...
        </div>
      }
    >
      <StoryFormProvider>
        <AdminWriteStoryContent />
      </StoryFormProvider>
    </Suspense>
  );
  }
