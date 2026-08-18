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
      try {
        const response =
          await fetch(
            `/api/comment-likes?commentId=${encodeURIComponent(
              commentId
            )}`,
            {
              cache: "no-store",
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
      toggling
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

      setLiked(
        Boolean(data.liked)
      );

      setLikeCount(
        Number(
          data.likeCount
        ) || 0
      );

      window.dispatchEvent(
        new Event(
          "notificationUpdated"
        )
      );
    } catch (error) {
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
      aria-label={
        liked
          ? `Unlike comment. ${likeCount} likes`
          : `Like comment. ${likeCount} likes`
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
