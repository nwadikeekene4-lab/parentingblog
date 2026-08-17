"use client";

import { useEffect, useState } from "react";

type CommentUser = {
  id: string;
  displayName: string;
  profileImage: string | null;
};

type CommentItem = {
  id: string;
  content: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies: CommentItem[];
};

type CommentsSectionProps = {
  storyId: string;
};

const MAX_COMMENT_LENGTH = 2000;

function formatDate(date: string) {
  const value = new Date(date);
  const now = new Date();

  const minutes = Math.floor(
    (now.getTime() - value.getTime()) / 60000
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return value.toLocaleDateString();
}

function Avatar({ user }: { user: CommentUser }) {
  const initial =
    user.displayName?.trim()?.charAt(0)?.toUpperCase() || "U";

  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.displayName}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
      {initial}
    </div>
  );
}

function CommentCard({
  comment,
  onReply,
}: {
  comment: CommentItem;
  onReply: (comment: CommentItem) => void;
}) {
  return (
    <div className="flex gap-3">
      <Avatar user={comment.user} />

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-gray-50 px-4 py-3">
          <p className="text-sm font-bold text-gray-900">
            {comment.user.displayName}
          </p>

          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
            {comment.content}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-4 px-2">
          <span className="text-[11px] text-gray-400">
            {formatDate(comment.createdAt)}
          </span>

          <button
            type="button"
            onClick={() => onReply(comment)}
            className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
          >
            Reply
          </button>
        </div>

        {comment.replies?.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4 sm:pl-6">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsSection({
  storyId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadComments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/comments?storyId=${encodeURIComponent(storyId)}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load comments."
        );
      }

      setComments(data.comments ?? []);
    } catch (error) {
      console.error("Load comments error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (storyId) {
      loadComments();
    }
  }, [storyId]);

  async function submitComment() {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Please enter a comment.");
      return;
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      setError(
        `Your comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
          content: trimmedContent,
          parentCommentId: replyTo?.id ?? null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit comment."
        );
      }

      setContent("");
      setReplyTo(null);

      await loadComments();

      window.dispatchEvent(
        new Event("notificationUpdated")
      );
    } catch (error) {
      console.error("Submit comment error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit comment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReply(comment: CommentItem) {
    setReplyTo(comment);
    setError("");

    const form = document.getElementById("comments-form");

    if (form) {
      window.scrollTo({
        top:
          window.scrollY +
          form.getBoundingClientRect().top -
          120,
        behavior: "smooth",
      });
    }
  }

  return (
    <section className="mt-10 border-t border-gray-200 pt-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Comments
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Join the conversation and share your thoughts.
        </p>
      </div>

      <div
        id="comments-form"
        className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      >
        {replyTo && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-2">
            <p className="min-w-0 truncate text-xs text-blue-700">
              Replying to{" "}
              <strong>{replyTo.user.displayName}</strong>
            </p>

            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="shrink-0 text-xs font-bold text-blue-600 transition hover:text-blue-800"
            >
              Cancel
            </button>
          </div>
        )}

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={4}
          placeholder={
            replyTo
              ? "Write your reply..."
              : "Write a comment..."
          }
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] text-gray-400">
            {content.length.toLocaleString()} /{" "}
            {MAX_COMMENT_LENGTH}
          </span>

          <button
            type="button"
            onClick={submitComment}
            disabled={submitting || !content.trim()}
            className="min-h-10 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Posting..."
              : replyTo
                ? "Post Reply"
                : "Post Comment"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse gap-3"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />

              <div className="flex-1">
                <div className="h-20 rounded-2xl bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-10 text-center">
          <div className="text-3xl">💬</div>

          <p className="mt-3 text-sm font-bold text-gray-800">
            No comments yet
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Be the first person to start the conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </section>
  );
}
