"use client";

import { useCallback, useEffect, useState } from "react";

type StoryLikeButtonProps = {
  storyId: string;
};

type LikeResponse = {
  liked: boolean;
  likeCount: number;
  message?: string;
};

export default function StoryLikeButton({
  storyId,
}: StoryLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // ==========================================================
  // LOAD LIKE STATUS
  // ==========================================================

  const loadLikes = useCallback(async () => {
    if (!storyId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/story-likes?storyId=${encodeURIComponent(
          storyId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: LikeResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load story likes."
        );
      }

      setLiked(Boolean(data.liked));

      setLikeCount(
        Number(data.likeCount) || 0
      );
    } catch (error) {
      console.error(
        "Failed to load story likes:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  // ==========================================================
  // TOGGLE LIKE
  // ==========================================================

  const toggleLike = async () => {
    if (
      toggling ||
      loading ||
      !storyId
    ) {
      return;
    }

    setToggling(true);

    const previousLiked = liked;
    const previousCount = likeCount;

    // --------------------------------------------------------
    // Optimistic update
    // --------------------------------------------------------

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
      const response = await fetch(
        "/api/story-likes",
        {
          method: previousLiked
            ? "DELETE"
            : "POST",

          headers: previousLiked
            ? undefined
            : {
                "Content-Type":
                  "application/json",
              },

          body: previousLiked
            ? undefined
            : JSON.stringify({
                storyId,
              }),
        }
      );

      const data: LikeResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update story like."
        );
      }

      // ------------------------------------------------------
      // Server remains the final source of truth.
      // ------------------------------------------------------

      setLiked(
        Boolean(data.liked)
      );

      setLikeCount(
        Number(data.likeCount) || 0
      );
    } catch (error) {
      // ------------------------------------------------------
      // Restore previous state if request fails.
      // ------------------------------------------------------

      setLiked(previousLiked);

      setLikeCount(
        previousCount
      );

      console.error(
        "Failed to update story like:",
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
  };

  // ==========================================================
  // LOADING UI
  // ==========================================================

  if (loading) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading likes"
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-400"
      >
        <span
          className="h-4 w-4 animate-pulse rounded-full bg-gray-200"
          aria-hidden="true"
        />

        <span>
          Likes
        </span>
      </button>
    );
  }

  // ==========================================================
  // LIKE BUTTON
  // ==========================================================

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={toggling}
      aria-pressed={liked}
      aria-label={
        liked
          ? `Unlike this story. ${likeCount} likes`
          : `Like this story. ${likeCount} likes`
      }
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        liked
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      } ${
        toggling
          ? "cursor-not-allowed opacity-70"
          : "active:scale-95"
      }`}
    >
      <span
        className="text-base leading-none"
        aria-hidden="true"
      >
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {likeCount}{" "}
        {likeCount === 1
          ? "Like"
          : "Likes"}
      </span>
    </button>
  );
  }
