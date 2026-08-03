"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStoryForm } from "./StoryFormContext";
import { uploadImage } from "@/lib/uploadImage";

export default function StoryActions() {
  const router = useRouter();

  const {
    title,
    content,
    category,
    coverImage,
    storyImages,
    tags,
    resetForm,
  } = useStoryForm();

  const [savingDraft, setSavingDraft] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  async function submitStory(
    status: "draft" | "published"
  ) {
    if (savingDraft || publishing) {
      return;
    }

    if (!title.trim()) {
      alert("Please enter a story title.");
      return;
    }

    if (!content.trim()) {
      alert("Please write your story.");
      return;
    }

    if (!category.trim()) {
      alert("Please select a category.");
      return;
    }

    if (
      status === "published" &&
      !coverImage
    ) {
      alert(
        "Please upload a cover image before publishing."
      );
      return;
    }

    if (status === "draft") {
      setSavingDraft(true);
    } else {
      setPublishing(true);
    }

    try {
      let uploadedCover = null;

      if (coverImage) {
        uploadedCover =
          await uploadImage(
            coverImage.file,
            "parenting-blog/cover-images"
          );
      }

      const uploadedStoryImages =
        await Promise.all(
          storyImages.map((image) =>
            uploadImage(
              image.file,
              "parenting-blog/story-images"
            )
          )
        );

      const response = await fetch(
        "/api/stories",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category: category.trim(),
            status,

            coverImageUrl:
              uploadedCover?.url ?? null,

            coverImagePublicId:
              uploadedCover?.publicId ?? null,

            storyImages:
              uploadedStoryImages.map(
                (image) => ({
                  url: image.url,
                  publicId:
                    image.publicId,
                })
              ),

            tags,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to save story."
        );
      }

      alert(data.message);

      resetForm();

      if (status === "published") {
        router.replace(
          "/users-dashboard/pending-review?submitted=true"
        );
      } else {
        router.replace(
          "/users-dashboard/drafts"
        );
      }

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setSavingDraft(false);

      setPublishing(false);

    }

  }

  async function saveDraft() {
    await submitStory("draft");
  }

  async function publishStory() {

    const confirmed =
      window.confirm(
        "Are you sure you want to publish this story?"
      );

    if (!confirmed) return;

    await submitStory(
      "published"
    );

  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-4 md:flex-row md:justify-end">

        <button
          type="button"
          className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Preview Story
        </button>

        <button
          type="button"
          onClick={saveDraft}
          disabled={
            savingDraft ||
            publishing
          }
          className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60"
        >
          {savingDraft
            ? "Saving..."
            : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={publishStory}
          disabled={
            savingDraft ||
            publishing
          }
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {publishing
            ? "Publishing..."
            : "Publish Story"}
        </button>

      </div>

    </section>
  );
          }
