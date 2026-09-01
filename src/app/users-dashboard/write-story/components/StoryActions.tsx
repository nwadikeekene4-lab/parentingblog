"use client";

import { useState } from "react";
import {
  useRouter,
  useSearchParams,
  useParams,
} from "next/navigation";

import { useStoryForm } from "./StoryFormContext";
import { uploadImage } from "@/lib/uploadImage";

// Sanitize error messages to prevent information leakage
function sanitizeErrorMessage(
  error: unknown,
  defaultMessage: string,
  isDevelopment: boolean = false
): string {
  // In production, show generic messages
  if (!isDevelopment) {
    // Only expose specific user-friendly messages
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Whitelist of safe error messages to expose
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
        message.includes("fetch")
      ) {
        return "Connection error. Please check your internet and try again.";
      }
    }
    
    // Default safe message for production
    return defaultMessage;
  }

  // In development, expose more details for debugging
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
}

// Validate HTTP response safety
function isValidHttpResponse(
  response: Response
): boolean {
  // Only allow specific status codes
  const allowedStatuses = [
    200, 201, 204, 400, 401, 403, 404, 409,
    422, 429, 500, 503,
  ];
  
  return allowedStatuses.includes(response.status);
}

// Sanitize API response data
function sanitizeResponseData(
  data: unknown
): {
  message: string;
  success: boolean;
} {
  if (!data || typeof data !== "object") {
    return {
      message: "Invalid response from server.",
      success: false,
    };
  }

  const record = data as Record<string, unknown>;
  
  // Only extract safe fields
  const message = record.message;
  
  if (
    typeof message === "string" &&
    message.length > 0 &&
    message.length < 500
  ) {
    return {
      message: message,
      success: !!record.story,
    };
  }

  return {
    message: "Operation completed.",
    success: !!record.story,
  };
}

export default function StoryActions() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const params = useParams();

  const draftId =
    (params.id as string | undefined) ??
    searchParams.get("draftId");

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

  // Check if running in development
  const isDev =
    process.env.NODE_ENV === "development";

  async function submitStory(
    status: "draft" | "published"
  ) {
    if (savingDraft || publishing) {
      return;
    }

    setErrorMessage("");

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Loading state
    |--------------------------------------------------------------------------
    */

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
      /*
      |--------------------------------------------------------------------------
      | Upload cover image
      |--------------------------------------------------------------------------
      */

      setProgress(15);

      setStatusMessage(
        status === "draft"
          ? "Saving your draft..."
          : "Uploading images..."
      );

      const coverUploadPromise =
  coverImage
    ? coverImage.url &&
      coverImage.publicId
      ? Promise.resolve({
          url: coverImage.url,
          publicId: coverImage.publicId,
        })
      : uploadImage(
          coverImage.file,
          "parenting-blog/cover-images"
        )
    : Promise.resolve(null);

      /*
      |--------------------------------------------------------------------------
      | Upload story images
      |--------------------------------------------------------------------------
      */

      const storyImagesUploadPromise =
        Promise.all(
          storyImages.map(
            async (image, index) => {
              if (image.url) {
                return {
                  url: image.url,
                  publicId:
                    image.publicId,
                };
              }

              const uploaded =
                await uploadImage(
                  image.file,
                  "parenting-blog/story-images"
                );

              if (
                status === "published"
              ) {
                setProgress(
                  20 +
                    Math.round(
                      ((index + 1) /
                        storyImages.length) *
                        40
                    )
                );

                setStatusMessage(
                  `Uploading story images (${index + 1}/${storyImages.length})...`
                );
              }

              return uploaded;
            }
          )
        );

      /*
      |--------------------------------------------------------------------------
      | Wait for uploads
      |--------------------------------------------------------------------------
      */

      const [
        uploadedCover,
        uploadedStoryImages,
      ] = await Promise.all([
        coverUploadPromise,
        storyImagesUploadPromise,
      ]);

      /*
      |--------------------------------------------------------------------------
      | Update local upload state
      |--------------------------------------------------------------------------
      */

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
        uploadedStoryImages.filter(
          (image) =>
            image.publicId
        ) as {
          url: string;
          publicId: string;
        }[]
      );

      /*
      |--------------------------------------------------------------------------
      | Save to database
      |--------------------------------------------------------------------------
      */

      setProgress(
        status === "draft"
          ? 70
          : 75
      );

      setStatusMessage(
        status === "draft"
          ? "Saving your draft..."
          : "Saving your story..."
      );

      /*
      |--------------------------------------------------------------------------
      | Validate endpoint URL for SSRF prevention
      |--------------------------------------------------------------------------
      */

      const endpoint = draftId
        ? `/api/drafts/${draftId}`
        : "/api/stories";

      // Validate endpoint is relative and safe
      if (!endpoint.startsWith("/")) {
        throw new Error(
          "Invalid endpoint URL"
        );
      }

      if (
        endpoint.includes("://") ||
        endpoint.includes("..")
      ) {
        throw new Error(
          "Invalid endpoint URL"
        );
      }

      const response =
        await fetch(endpoint, {
          method: draftId
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),

            content:
              content.trim(),

            category:
              category.trim(),

            status,

            coverImageUrl:
              uploadedCover?.url ??
              null,

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
        });

      /*
      |--------------------------------------------------------------------------
      | Validate response object
      |--------------------------------------------------------------------------
      */

      if (!isValidHttpResponse(response)) {
        throw new Error(
          "Unexpected server response"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Parse response safely
      |--------------------------------------------------------------------------
      */

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid server response format"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Check response status and sanitize message
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        const sanitized = sanitizeResponseData(
          data
        );
        
        throw new Error(
          sanitized.message ||
            `Server error: ${response.status}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      if (status === "published") {
        setProgress(100);

        setStatusMessage(
          "Story submitted successfully!"
        );

        /*
        | IMPORTANT:
        | Reset form after successful publish
        */

        resetForm();

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        try {
          const redirectUrl =
            "/users-dashboard/pending-review?submitted=true";

          // Validate redirect URL
          if (!redirectUrl.startsWith("/")) {
            throw new Error(
              "Invalid redirect URL"
            );
          }

          window.location.href = redirectUrl;
        } catch (navigationError) {
          console.error(
            "Navigation error:",
            navigationError
          );
          
          setErrorMessage(
            "Story published! Please navigate to pending review manually."
          );
          
          setProgress(0);
          setStatusMessage("");
        }

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | DRAFT SAVED SUCCESSFULLY
      |--------------------------------------------------------------------------
      */

      setStatusMessage(
        "Draft saved successfully!"
      );

      setProgress(100);

      /*
      | IMPORTANT:
      | Only reset after the database confirms success.
      */

      resetForm();

      /*
      | Use a full navigation so the drafts page
      | fetches completely fresh data.
      */

      try {
        const redirectUrl =
          "/users-dashboard/drafts";

        // Validate redirect URL
        if (!redirectUrl.startsWith("/")) {
          throw new Error(
            "Invalid redirect URL"
          );
        }

        window.location.href = redirectUrl;
      } catch (navigationError) {
        console.error(
          "Navigation error:",
          navigationError
        );
        
        setErrorMessage(
          "Draft saved! Please navigate to drafts manually."
        );
        
        setProgress(0);
        setStatusMessage("");
      }

    } catch (error) {
      console.error(
        "Save story error:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | Sanitize error message for display
      |--------------------------------------------------------------------------
      */

      const displayError =
        sanitizeErrorMessage(
          error,
          "Unable to save your story. Please try again.",
          isDev
        );

      setErrorMessage(displayError);

      /*
      | Important: Do NOT redirect on error
      */

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
    const confirmed =
      window.confirm(
        "Are you sure you want to publish this story?"
      );

    if (!confirmed) {
      return;
    }

    await submitStory(
      "published"
    );
  }

  return (
    <>
      {publishing && (
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

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

      </section>
    </>
  );
    }
