"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type UserRole =
  | "admin"
  | "user"
  | "moderator";

type AdminUser = {
  id: string;
  displayName: string;
  email: string;
  profileImage: string | null;
  role: UserRole;
  emailVerified: boolean;
  emailNotifications: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UsersResponse = {
  users: AdminUser[];
  pagination: Pagination;
};

export default function AdminUsersPage() {
  const [users, setUsers] =
    useState<AdminUser[]>([]);

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

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadUsers = useCallback(
    async (
      page = 1,
      searchValue = search,
      role = roleFilter,
      status = statusFilter
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

        if (role !== "all") {
          params.set(
            "role",
            role
          );
        }

        if (status !== "all") {
          params.set(
            "status",
            status
          );
        }

        const response =
          await fetch(
            `/api/admin/users?${params.toString()}`,
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
            "You do not have permission to manage users."
          );
        }

        const data =
          (await response.json()) as
            | UsersResponse
            | { message?: string };

        if (!response.ok) {
          throw new Error(
            "message" in data &&
              data.message
              ? data.message
              : "Failed to load users."
          );
        }

        const result =
          data as UsersResponse;

        setUsers(
          Array.isArray(result.users)
            ? result.users
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
          "Admin users page error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      roleFilter,
      statusFilter,
    ]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const value =
      searchInput.trim();

    setSearch(value);

    loadUsers(
      1,
      value,
      roleFilter,
      statusFilter
    );
  }

  function handleRoleChange(
    value: string
  ) {
    setRoleFilter(value);

    loadUsers(
      1,
      search,
      value,
      statusFilter
    );
  }

  function handleStatusChange(
    value: string
  ) {
    setStatusFilter(value);

    loadUsers(
      1,
      search,
      roleFilter,
      value
    );
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");

    loadUsers(
      1,
      "",
      "all",
      "all"
    );
  }

  async function updateUser(
    userId: string,
    changes: {
      role?: UserRole;
      isActive?: boolean;
    }
  ) {
    try {
      setUpdatingId(userId);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/users/${userId}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              changes
            ),
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
            "Failed to update user."
        );
      }

      setSuccess(
        data.message ??
          "User updated successfully."
      );

      await loadUsers(
        pagination.page
      );
    } catch (error) {
      console.error(
        "Update user error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update user."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function roleLabel(
    role: UserRole
  ) {
    if (role === "admin") {
      return "Admin";
    }

    if (role === "moderator") {
      return "Moderator";
    }

    return "User";
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function UserCard({
    user,
  }: {
    user: AdminUser;
  }) {
    const updating =
      updatingId === user.id;

    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
        <div className="flex gap-4">

          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-emerald-100">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.displayName}
                fill
                unoptimized
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-emerald-700">
                {user.displayName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">
                  {user.displayName}
                </h2>

                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {user.email}
                </p>
              </div>

              <span
                className={`
                  inline-flex
                  w-fit
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-bold
                  ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : user.role ===
                        "moderator"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }
                `}
              >
                {roleLabel(
                  user.role
                )}
              </span>

            </div>

            <div className="mt-3 flex flex-wrap gap-2">

              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  ${
                    user.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }
                `}
              >
                {user.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  ${
                    user.emailVerified
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }
                `}
              >
                {user.emailVerified
                  ? "Email verified"
                  : "Email not verified"}
              </span>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Joined{" "}
              {formatDate(
                user.createdAt
              )}
            </p>

          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">

          <div>
            <label
              htmlFor={`role-${user.id}`}
              className="mb-1.5 block text-xs font-semibold text-slate-500"
            >
              Role
            </label>

            <select
              id={`role-${user.id}`}
              value={user.role}
              disabled={updating}
              onChange={(event) =>
                updateUser(
                  user.id,
                  {
                    role:
                      event.target
                        .value as UserRole,
                  }
                )
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="user">
                User
              </option>

              <option value="moderator">
                Moderator
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Account
            </label>

            <button
              type="button"
              disabled={updating}
              onClick={() =>
                updateUser(
                  user.id,
                  {
                    isActive:
                      !user.isActive,
                  }
                )
              }
              className={`
                h-10
                w-full
                rounded-xl
                px-3
                text-sm
                font-semibold
                transition
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${
                  user.isActive
                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }
              `}
            >
              {updating
                ? "Updating..."
                : user.isActive
                ? "Deactivate User"
                : "Activate User"}
            </button>
          </div>

        </div>
      </article>
    );
  }

  return (
    <main className="w-full space-y-6">

      <section className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-6 text-white shadow-lg sm:rounded-3xl sm:px-7 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-100 sm:text-sm">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100">
              Manage registered users, roles and account access.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "User"
              : "Users"}
          </div>

        </div>
      </section>

      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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
            className="font-bold text-emerald-700"
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
            className="font-bold text-red-700"
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
            placeholder="Search by name or email..."
            className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <button
            type="submit"
            className="h-11 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Search Users
          </button>

          <select
            value={roleFilter}
            onChange={(event) =>
              handleRoleChange(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="all">
              All Roles
            </option>

            <option value="user">
              Users
            </option>

            <option value="moderator">
              Moderators
            </option>

            <option value="admin">
              Admins
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              handleStatusChange(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          {(search ||
            roleFilter !== "all" ||
            statusFilter !== "all") && (
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

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading users...
          </p>

        </section>
      ) : users.length > 0 ? (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
              />
            ))}
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
                    loadUsers(
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
                    loadUsers(
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
            👤
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No users found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters.
                     </p>

        </section>
      )}

    </main>
  );
}
    
