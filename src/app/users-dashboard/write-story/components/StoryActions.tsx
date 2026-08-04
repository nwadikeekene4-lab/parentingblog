"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStoryForm } from "./StoryFormContext";
import { uploadImage } from "@/lib/uploadImage";
import PublishingOverlay from "./PublishingOverlay";

export default function StoryActions() {
  const router = useRouter();

const {
  title,
  content,
  category,
  coverImage,
  storyImages,
  updateCoverUpload,
  updateStoryImageUploads,
  resetForm,
} = useStoryForm();

  const [savingDraft, setSavingDraft] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  async function submitStory(
    status: "draft" | "published"
  ) {
    if (savingDraft || publishing) {
      return;
    }

    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage(
        "Please enter a story title."
      );
      return;
    }

    if (!content.trim()) {
      setErrorMessage(
        "Please write your story."
      );
      return;
    }

    if (!category.trim()) {
      setErrorMessage(
        "Please select a category."
      );
      return;
    }

    if (
      status === "published" &&
      !coverImage
    ) {
      setErrorMessage(
        "Please upload a cover image before publishing."
      );
      return;
    }

    if (status === "draft") {
      setSavingDraft(true);
    } else {
      setPublishing(true);

      setProgress(5);

      setStatusMessage(
        "Preparing your story..."
      );
    }

    try {

      setProgress(15);

setStatusMessage(
  "Uploading images..."
);

const coverUploadPromise =
  coverImage?.url
    ? Promise.resolve({
        url: coverImage.url,
        publicId: coverImage.publicId,
      })
    : coverImage
    ? uploadImage(
        coverImage.file,
        "parenting-blog/cover-images"
      )
    : Promise.resolve(null);



const storyImagesUploadPromise =
  Promise.all(
    storyImages.map((image) =>
      image.url
        ? Promise.resolve({
            url: image.url,
            publicId: image.publicId,
          })
        : uploadImage(
            image.file,
            "parenting-blog/story-images"
          )
    )
  );


const [
  uploadedCover,
  uploadedStoryImages,
] = await Promise.all([
  coverUploadPromise,
  storyImagesUploadPromise,
]);
      if (
  uploadedCover &&
  uploadedCover.publicId
) {
  updateCoverUpload(
    uploadedCover.url,
    uploadedCover.publicId
  );
      }

updateStoryImageUploads(
  uploadedStoryImages
);


setProgress(60);

setStatusMessage(
  "Images uploaded successfully..."
);
      setProgress(75);

      setStatusMessage(
        "Saving your story..."
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
              uploadedCover?.publicId ??
              null,

            storyImages:
              uploadedStoryImages.map(
                (image) => ({
                  url: image.url,
                  publicId:
                    image.publicId,
                })
              ),

        
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

      if (status === "published") {

        setProgress(100);

        setStatusMessage(
          "Story submitted successfully!"
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 700)
        );

      }

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

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setSavingDraft(false);

      setPublishing(false);

      setProgress(0);

      setStatusMessage("");

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
    <>      {publishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

          <div className="w-[92%] max-w-md rounded-3xl bg-white p-8 shadow-2xl">

            <h2 className="text-xl font-bold text-gray-900">
              Publishing Story
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {statusMessage}
            </p>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

            <p className="mt-3 text-right text-sm font-semibold text-blue-600">
              {progress}%
            </p>

            {errorMessage && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

          </div>

        </div>
      )}

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
            className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing
              ? "Publishing..."
              : "Publish Story"}
          </button>

        </div>

      </section>

    </>
  );
}
