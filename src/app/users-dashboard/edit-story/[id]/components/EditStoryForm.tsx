"use client";

import { useEffect, useState } from "react";
import EditCategorySelector from "./EditCategorySelector";
import EditStoryEditor from "./EditStoryEditor";

type StoryImage = {
  id: string;
  imageUrl: string;
  publicId: string;
  caption?: string | null;
  displayOrder: number;
};

type StoryData = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category: string;
  coverImage: string | null;
  coverImagePublicId: string | null;
  images: StoryImage[];
};

type EditStoryFormProps = {
  storyId: string;
};

export default function EditStoryForm({
  storyId,
}: EditStoryFormProps) {
  const [story, setStory] =
    useState<StoryData | null>(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/stories/${storyId}`,
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
              "Failed to load story."
          );
        }

        if (!cancelled) {
          setStory(data.story);

          setTitle(
            data.story.title ?? ""
          );

          setContent(
            data.story.content ?? ""
          );
        }
      } catch (error) {
        console.error(
          "Load story for editing error:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load story."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStory();

    return () => {
      cancelled = true;
    };
  }, [storyId]);

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">
          Loading story...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-red-800">
          Unable to load story
        </h2>

        <p className="mt-2 text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (!story) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">
          Story not found.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">

      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
        <h2 className="font-semibold text-yellow-900">
          Story is awaiting review
        </h2>

        <p className="mt-1 text-sm text-yellow-800">
          You can make changes to your story here.
          After saving, it will remain pending review.
        </p>
      </section>

      <EditStoryEditor
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
      />

    </div>
  );
}
