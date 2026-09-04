"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type StoryOwnerActionsProps = {
  storyId: string;
};

export default function StoryOwnerActions({
  storyId,
}: StoryOwnerActionsProps) {
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState("");

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(
        `/api/stories/${storyId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ??
            "We couldn't delete this story. Please try again."
        );
      }

      setShowDeleteDialog(false);

      router.push("/users-dashboard/my-stories");
      router.refresh();
    } catch (error) {
      console.error(
        "Delete published story error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting your story."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/users-dashboard/drafts/${storyId}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit Story
        </Link>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowDeleteDialog(true);
          }}
          disabled={isDeleting}
          className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete Story
        </button>
      </div>

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-story-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl">
                ⚠️
              </div>

              <div>
                <h2
                  id="delete-story-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Delete this story?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This story will be removed from your
                  published stories and will no longer be
                  publicly accessible.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setError("");
                }}
                disabled={isDeleting}
                className="w-full rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Yes, Delete Story"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
    }
