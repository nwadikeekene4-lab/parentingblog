"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReviewActionsProps = {
  storyId: string;
  storyTitle: string;
};

export default function ReviewActions({
  storyId,
  storyTitle,
}: ReviewActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState<
    "approve" | "reject" | null
  >(null);

  const [showRejectForm, setShowRejectForm] =
    useState(false);

  const [feedback, setFeedback] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Approve
  |--------------------------------------------------------------------------
  */

  async function handleApprove() {
    const confirmed = window.confirm(
      `Approve "${storyTitle}" and publish it now?`
    );

    if (!confirmed) {
      return;
    }

    setLoading("approve");
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin/pending-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
            storyId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to approve this story."
        );
      }

      setSuccess(
        "Story approved and published successfully."
      );

      /*
      |--------------------------------------------------------------------------
      | Return to pending review after a short moment.
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {
        router.push("/admin/pending-review");
        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve this story."
      );
    } finally {
      setLoading(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Reject
  |--------------------------------------------------------------------------
  */

  async function handleReject() {
    const trimmedFeedback = feedback.trim();

    if (!trimmedFeedback) {
      setError(
        "Please provide a reason for rejecting this story."
      );
      return;
    }

    if (trimmedFeedback.length < 5) {
      setError(
        "Rejection feedback must be at least 5 characters."
      );
      return;
    }

    if (trimmedFeedback.length > 1000) {
      setError(
        "Rejection feedback cannot exceed 1,000 characters."
      );
      return;
    }

    setLoading("reject");
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin/pending-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "reject",
            storyId,
            feedback: trimmedFeedback,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to reject this story."
        );
      }

      setSuccess(
        "Story rejected and returned to the author."
      );

      setFeedback("");
      setShowRejectForm(false);

      setTimeout(() => {
        router.push("/admin/pending-review");
        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reject this story."
      );
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

  return (
    <div className="mt-5">
      {/* Error */}

      {error && (
        <div
          role="alert"
          className="
            mb-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            leading-6
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div
          role="status"
          className="
            mb-4
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            px-4
            py-3
            text-sm
            font-medium
            leading-6
            text-emerald-700
          "
        >
          {success}
        </div>
      )}

      {/* Main actions */}

      {!showRejectForm && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isLoading}
            className="
              flex-1
              rounded-xl
              bg-emerald-600
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading === "approve"
              ? "Approving..."
              : "✓ Approve Story"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowRejectForm(true);
              setError("");
            }}
            disabled={isLoading}
            className="
              flex-1
              rounded-xl
              bg-red-600
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            ✕ Reject Story
          </button>
        </div>
      )}

      {/* Reject form */}

      {showRejectForm && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            sm:p-5
          "
        >
          <h3 className="font-bold text-red-900">
            Reject this story
          </h3>

          <p className="mt-1 text-sm leading-6 text-red-700">
            Explain what the author needs to change.
            This feedback will be sent to the author.
          </p>

          <textarea
            value={feedback}
            onChange={(event) =>
              setFeedback(event.target.value)
            }
            maxLength={1000}
            rows={5}
            placeholder="Example: Please revise the introduction and provide more details about..."
            disabled={isLoading}
            className="
              mt-4
              w-full
              resize-y
              rounded-xl
              border
              border-red-200
              bg-white
              px-4
              py-3
              text-sm
              leading-6
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-red-400
              focus:ring-2
              focus:ring-red-100
              disabled:cursor-not-allowed
              disabled:bg-slate-100
            "
          />

          <div className="mt-2 text-right text-xs text-slate-500">
            {feedback.length}/1000
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setError("");
              }}
              disabled={isLoading}
              className="
                flex-1
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-slate-700
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={isLoading}
              className="
                flex-1
                rounded-xl
                bg-red-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading === "reject"
                ? "Rejecting..."
                : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
          }
