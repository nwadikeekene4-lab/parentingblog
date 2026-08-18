"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type CommentLikeButtonProps = {
  commentId: string;
  initialLikeCount?: number;
  initialLiked?: boolean;
};

type LikeResponse = {
  liked: boolean;
  likeCount: number;
  message?: string;
};

export default function CommentLikeButton({
  commentId,
  initialLikeCount = 0,
  initialLiked = false,
}: CommentLikeButtonProps) {
  const [liked, setLiked] =
    useState(initialLiked);

  const [likeCount, setLikeCount] =
    useState(initialLikeCount);

  const [loading, setLoading] =
    useState(true);

  const [toggling, setToggling] =
    useState(false);

  const loadLikeStatus =
    useCallback(async () => {
      if (!commentId) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await fetch(
            `/api/comment-likes?commentId=${encodeURIComponent(
              commentId
            )}`,
            {
              method: "GET",
              cache: "no-store",
              credentials: "same-origin",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load comment likes."
          );
        }

        const commentData =
          data.comments?.[commentId];

        if (commentData) {
          setLiked(
            Boolean(
              commentData.liked
            )
          );

          setLikeCount(
            Number(
              commentData.likeCount
            ) || 0
          );
        }
      } catch (error) {
        console.error(
          "Load comment like error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [commentId]);

  useEffect(() => {
    loadLikeStatus();
  }, [loadLikeStatus]);

  async function toggleLike() {
    if (
      loading ||
      toggling ||
      !commentId
    ) {
      return;
    }

    const previousLiked =
      liked;

    const previousCount =
      likeCount;

    setToggling(true);

    /*
     * Optimistic update.
     *
     * This makes the button respond
     * immediately while the server
     * processes the request.
     */

    setLiked(!previousLiked);

    setLikeCount(
      previousLiked
        ? Math.max(
            0,
            previousCount - 1
          )
        : previousCount + 1
    );

    try {
      const response =
        await fetch(
          "/api/comment-likes",
          {
            method: previousLiked
              ? "DELETE"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "same-origin",

            body: JSON.stringify({
              commentId,
            }),
          }
        );

      const data: LikeResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update comment like."
        );
      }

      /*
       * Use the server's final values.
       * This keeps the UI synchronized
       * with the database.
       */

      setLiked(
        Boolean(data.liked)
      );

      setLikeCount(
        Number(
          data.likeCount
        ) || 0
      );

      /*
       * Keep the existing notification
       * refresh behavior for registered
       * users.
       *
       * Anonymous likes do not create
       * notifications on the server,
       * so this event is harmless for
       * anonymous visitors.
       */

      window.dispatchEvent(
        new Event(
          "notificationUpdated"
        )
      );
    } catch (error) {
      /*
       * Restore the previous state if
       * the server request fails.
       */

      setLiked(
        previousLiked
      );

      setLikeCount(
        previousCount
      );

      console.error(
        "Toggle comment like error:",
        error
      );

      if (
        error instanceof Error &&
        error.message
      ) {
        alert(error.message);
      } else {
        alert(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setToggling(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={
        loading ||
        toggling
      }
      aria-pressed={liked}
      aria-busy={toggling}
      aria-label={
        liked
          ? `Unlike comment. ${likeCount} likes`
          : `Like comment. ${likeCount} likes`
      }
      title={
        liked
          ? "Unlike comment"
          : "Like comment"
      }
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold transition ${
        liked
          ? "bg-blue-50 text-blue-600"
          : "text-gray-400 hover:bg-gray-50 hover:text-blue-600"
      } ${
        toggling
          ? "cursor-not-allowed opacity-60"
          : ""
      }`}
    >
      <span
        className="text-sm leading-none"
        aria-hidden="true"
      >
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {loading
          ? "..."
          : likeCount}
      </span>
    </button>
  );
}
