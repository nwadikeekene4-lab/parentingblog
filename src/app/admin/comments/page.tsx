"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type CommentStatus =
  | "visible"
  | "hidden"
  | "deleted";

type AdminComment = {
  id: string;

  story: {
    id: string;
    title: string;
    slug: string;
  };

  author: {
    type:
      | "registered"
      | "anonymous";
    id: string | null;
    name: string;
    email: string;
  };

  type:
    | "comment"
    | "reply";

  parentCommentId:
    | string
    | null;

  content: string;

  status: CommentStatus;

  isApproved: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CommentsResponse = {
  comments: AdminComment[];
  pagination: Pagination;
};

export default function AdminCommentsPage() {
  const [comments, setComments] =
    useState<AdminComment[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadComments = useCallback(
    async (
      page = 1,
      searchValue = search,
      statusValue = status
    ) => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "20"
        );

        if (searchValue.trim()) {
          params.set(
            "search",
            searchValue.trim()
          );
        }

        if (
          statusValue !== "all"
        ) {
          params.set(
            "status",
            statusValue
          );
        }

        const response =
          await fetch(
            `/api/admin/comments?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        if (response.status === 401) {
          window.location.href =
            "/auth";
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to moderate comments."
          );
        }

        const data =
          (await response.json()) as
            | CommentsResponse
            | {
                message?: string;
              };

        if (!response.ok) {
          throw new Error(
            "message" in data &&
              data.message
              ? data.message
              : "Failed to load comments."
          );
        }

        const result =
          data as CommentsResponse;

        setComments(
          Array.isArray(
            result.comments
          )
            ? result.comments
            : []
        );

        setPagination(
          result.pagination ?? {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (error) {
        console.error(
          "Admin comments page error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load comments."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, status]
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const value =
      searchInput.trim();

    setSearch(value);

    loadComments(
      1,
      value,
      status
    );
  }

  function handleStatusChange(
    value: string
  ) {
    setStatus(value);

    loadComments(
      1,
      search,
      value
    );
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");

    loadComments(
      1,
      "",
      "all"
    );
  }

  async function moderateComment(
    commentId: string,
    action:
      | "hide"
      | "restore"
      | "delete"
  ) {
    try {
      setUpdatingId(
        commentId
      );

      setError("");
      setSuccess("");

      const response =
        await fetch(
          "/api/admin/comments",
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              commentId,
              action,
            }),
          }
        );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/auth";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Unable to moderate comment."
        );
      }

      setSuccess(
        data.message ??
          "Comment updated successfully."
      );

      await loadComments(
        pagination.page
      );
    } catch (error) {
      console.error(
        "Moderate comment error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to moderate comment."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function statusLabel(
    value: CommentStatus
  ) {
    if (value === "visible") {
      return "Visible";
    }

    if (value === "hidden") {
      return "Hidden";
    }

    return "Deleted";
  }

  return (
    <main className="w-full space-y-6">

      <section className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-5 py-6 text-white shadow-lg sm:rounded-3xl sm:px-7 sm:py-7 lg:px-8">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-100 sm:text-sm">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Comment Moderation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Review and manage comments and replies across the website.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "Comment"
              : "Comments"}
          </div>

        </div>

      </section>

      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      {success && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>{success}</p>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
            placeholder="Search comments, users or stories..."
            className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="submit"
            className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Search
          </button>

          <select
            value={status}
            onChange={(event) =>
              handleStatusChange(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              All Comments
            </option>

            <option value="visible">
              Visible
            </option>

            <option value="hidden">
              Hidden
            </option>

            <option value="deleted">
              Deleted
            </option>
          </select>

          {(search ||
            status !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}

        </form>

      </section>

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading comments...
          </p>

        </section>
      ) : comments.length > 0 ? (
        <>

          <section className="space-y-4">

            {comments.map(
              (comment) => {
                const updating =
                  updatingId ===
                  comment.id;

                return (
                  <article
                    key={comment.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                  >

                    <div className="flex flex-col gap-4">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                comment.author
                                  .type ===
                                "registered"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              }
                            `}
                          >
                            {comment.author
                              .type ===
                            "registered"
                              ? "Registered User"
                              : "Anonymous"}
                          </span>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {comment.type ===
                            "reply"
                              ? "Reply"
                              : "Comment"}
                          </span>

                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                comment.status ===
                                "visible"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : comment.status ===
                                    "hidden"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }
                            `}
                          >
                            {statusLabel(
                              comment.status
                            )}
                          </span>

                        </div>

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            comment.createdAt
                          )}
                        </span>

                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {comment.author
                            .name}
                        </p>

                        {comment.author
                          .email && (
                          <p className="text-xs text-slate-400">
                            {
                              comment.author
                                .email
                            }
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {comment.content}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Story
                          </p>

                          <Link
                            href={`/stories/${comment.story.slug}`}
                            target="_blank"
                            className="mt-1 block truncate text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {
                              comment.story
                                .title
                            }
                          </Link>
                        </div>

                        <div className="flex flex-wrap gap-2">

                          {comment.status ===
                            "visible" && (
                            <button
                              type="button"
                              disabled={
                                updating
                              }
                              onClick={() =>
                                moderateComment(
                                  comment.id,
                                  "hide"
                                )
                              }
                              className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : "Hide"}
                            </button>
                          )}

                          {comment.status ===
                            "hidden" && (
                            <button
                              type="button"
                              disabled={
                                updating
                              }
                              onClick={() =>
                                moderateComment(
                                  comment.id,
                                  "restore"
                                )
                              }
                              className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : "Restore"}
                            </button>
                          )}

                          {comment.status ===
                            "deleted" && (
                            <button
                              type="button"
                              disabled={
                                updating
                              }
                              onClick={() =>
                                moderateComment(
                                  comment.id,
                                  "restore"
                                )
                              }
                              className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {updating
                                ? "Restoring..."
                                : "Restore"}
                            </button>
                          )}

                          {comment.status !==
                            "deleted" && (
                            <button
                              type="button"
                              disabled={
                                updating
                              }
                              onClick={() => {
                                const confirmed =
                                  window.confirm(
                                    "Delete this comment? It will be hidden from the public website but can be restored later."
                                  );

                                if (
                                  confirmed
                                ) {
                                  moderateComment(
                                    comment.id,
                                    "delete"
                                  );
                                }
                              }}
                              className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>

          {pagination.totalPages >
            1 && (
            <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">

              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={
                    pagination.page <=
                    1
                  }
                  onClick={() =>
                    loadComments(
                      pagination.page -
                        1
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    loadComments(
                      pagination.page +
                        1
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>

              </div>

            </section>
          )}

        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">

          <div className="text-5xl">
            💬
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No comments found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or status filter.
          </p>

        </section>
      )}

    </main>
  );
}
