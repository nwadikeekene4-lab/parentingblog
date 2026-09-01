"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

import { useStoryForm } from "./StoryFormContext";
import { uploadImage } from "@/lib/uploadImage";

type UploadedResult = {
  url: string;
  publicId: string;
};

function getSafeErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("unauthorized") ||
    message.includes("not authenticated")
  ) {
    return "You must be logged in to save stories.";
  }

  if (
    message.includes("category not found") ||
    message.includes("invalid category")
  ) {
    return "The selected category is not available. Please refresh and try again.";
  }

  if (
    message.includes("title") ||
    message.includes("content") ||
    message.includes("required")
  ) {
    return "Please fill in all required fields correctly.";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch")
  ) {
    return "Connection error. Please check your internet connection and try again.";
  }

  return fallback;
}

export default function StoryActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const draftId =
    (params?.id as string | undefined) ??
    searchParams.get("draftId") ??
    searchParams.get("edit") ??
    undefined;

  const {
    title,
    content,
    category,
    coverImage,
    storyImages,
    resetForm,
  } = useStoryForm();

  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  const busy = savingDraft || publishing;

  async function submitStory(
    requestedStatus: "draft" | "published"
  ) {
    if (busy) {
      return;
    }

    setErrorMessage("");

    /*
    |--------------------------------------------------------------------------
    | Client-side validation
    |--------------------------------------------------------------------------
    */

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanCategory = category.trim();

    if (!cleanTitle) {
      setErrorMessage("Please enter a story title.");
      return;
    }

    if (!cleanContent) {
      setErrorMessage("Please write your story.");
      return;
    }

    if (!cleanCategory) {
      setErrorMessage("Please select a category.");
      return;
    }

    if (requestedStatus === "published" && !coverImage) {
      setErrorMessage(
        "Please upload a cover image before submitting your story."
      );
      return;
    }

    if (requestedStatus === "draft") {
      setSavingDraft(true);
      setStatusMessage("Saving your draft...");
      setProgress(10);
    } else {
      setPublishing(true);
      setStatusMessage("Preparing your story...");
      setProgress(5);
    }

    try {
      /*
      |--------------------------------------------------------------------------
      | Upload cover image
      |--------------------------------------------------------------------------
      |
      | Existing uploaded images already have a URL.
      | Never try to upload their placeholder File again.
      |--------------------------------------------------------------------------
      */

      let uploadedCover: UploadedResult | null = null;

      if (coverImage) {
        if (coverImage.url) {
          uploadedCover = {
            url: coverImage.url,
            publicId: coverImage.publicId ?? "",
          };
        } else {
          setStatusMessage("Uploading cover image...");

          uploadedCover = await uploadImage(
            coverImage.file,
            "parenting-blog/cover-images"
          );
        }
      }

      setProgress(
        requestedStatus === "published" ? 30 : 30
      );

      /*
      |--------------------------------------------------------------------------
      | Upload story images concurrently
      |--------------------------------------------------------------------------
      */

      const uploadedStoryImages: UploadedResult[] =
        await Promise.all(
          storyImages.map(async (image, index) => {
            if (image.url) {
              return {
                url: image.url,
                publicId: image.publicId ?? "",
              };
            }

            const uploaded = await uploadImage(
              image.file,
              "parenting-blog/story-images"
            );

            if (requestedStatus === "published") {
              const imageProgress =
                30 +
                Math.round(
                  ((index + 1) /
                    Math.max(storyImages.length, 1)) *
                    35
                );

              setProgress(imageProgress);

              setStatusMessage(
                `Uploading story images (${index + 1}/${storyImages.length})...`
              );
            }

            return uploaded;
          })
        );

      setProgress(70);

      setStatusMessage(
        requestedStatus === "draft"
          ? "Saving your draft..."
          : "Submitting your story for review..."
      );

      /*
      |--------------------------------------------------------------------------
      | Determine API endpoint
      |--------------------------------------------------------------------------
      */

      const endpoint = draftId
        ? `/api/drafts/${encodeURIComponent(draftId)}`
        : "/api/stories";

      /*
      |--------------------------------------------------------------------------
      | Save to database
      |--------------------------------------------------------------------------
      */

      const response = await fetch(endpoint, {
        method: draftId ? "PATCH" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "same-origin",

        cache: "no-store",

        body: JSON.stringify({
          title: cleanTitle,

          content: cleanContent,

          category: cleanCategory,

          status: requestedStatus,

          coverImageUrl:
            uploadedCover?.url ?? null,

          coverImagePublicId:
            uploadedCover?.publicId || null,

          storyImages:
            uploadedStoryImages
              .filter(
                (image) => image.url
              )
              .map((image) => ({
                url: image.url,
                publicId:
                  image.publicId || "",
              })),
        }),
      });

      let data: {
        message?: string;
        story?: unknown;
      } = {};

      try {
        data = await response.json();
      } catch {
        if (!response.ok) {
          throw new Error(
            "The server returned an invalid response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Unable to save your story."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setProgress(100);

      if (requestedStatus === "published") {
        setStatusMessage(
          "Story submitted successfully!"
        );
      } else {
        setStatusMessage(
          "Draft saved successfully!"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Clear the form BEFORE navigation.
      |--------------------------------------------------------------------------
      */

      resetForm();

      /*
      |--------------------------------------------------------------------------
      | Navigate using Next.js router.
      |--------------------------------------------------------------------------
      |
      | This avoids a complete browser reload and is faster.
      |--------------------------------------------------------------------------
      */

      if (requestedStatus === "published") {
        router.replace(
          "/users-dashboard/pending-review?submitted=true"
        );
      } else {
        router.replace(
          "/users-dashboard/drafts?saved=true"
        );
      }
    } catch (error) {
      console.error(
        "Story submission error:",
        error
      );

      setErrorMessage(
        getSafeErrorMessage(
          error,
          requestedStatus === "draft"
            ? "Unable to save your draft. Please try again."
            : "Unable to submit your story. Please try again."
        )
      );

      setProgress(0);
      setStatusMessage("");
    } finally {
      setSavingDraft(false);
      setPublishing(false);
    }
  }

  async function saveDraft() {
    await submitStory("draft");
  }

  async function publishStory() {
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit this story for review?"
    );

    if (!confirmed) {
      return;
    }

    await submitStory("published");
  }

  function openPreview() {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage(
        "Please enter a story title before previewing."
      );
      return;
    }

    if (!content.trim()) {
      setErrorMessage(
        "Please write some story content before previewing."
      );
      return;
    }

    setShowPreview(true);
  }

  return (
    <>
      {publishing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publishing-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2
              id="publishing-title"
              className="text-xl font-bold text-gray-900"
            >
              Submitting Story
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

      {showPreview && (
        <div
          className="fixed inset-0 z-40 overflow-y-auto bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
        >
          <div className="mx-auto my-8 w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <h2
                id="preview-title"
                className="text-xl font-bold text-gray-900"
              >
                Story Preview
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <article className="p-6 md:p-10">
              {coverImage?.preview && (
                <img
                  src={coverImage.preview}
                  alt=""
                  className="mb-8 h-64 w-full rounded-2xl object-cover md:h-96"
                />
              )}

              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
                {category || "Story"}
              </p>

              <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                {title}
              </h1>

              <div className="prose prose-gray mt-8 max-w-none whitespace-pre-wrap">
                {content}
              </div>

              {storyImages.length > 0 && (
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {storyImages.map((image) => (
                    <img
                      key={image.id}
                      src={image.preview}
                      alt=""
                      className="h-64 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={openPreview}
            disabled={busy}
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Preview Story
          </button>

          <button
            type="button"
            onClick={saveDraft}
            disabled={busy}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingDraft
              ? "Saving..."
              : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={publishStory}
            disabled={busy}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing
              ? "Submitting..."
              : "Publish Story"}
          </button>
        </div>

        {errorMessage && !publishing && (
          <p
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </section>
    </>
  );
      }
