"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DashboardNavItem from "./DashboardNavItem";

export default function DashboardSidebar() {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout request failed");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      setLoggingOut(false);

      alert(
        "Unable to log out right now. Please try again."
      );
    }
  }

  return (
    <aside
      className="
        sticky
        top-0
        hidden
        h-dvh
        w-72
        flex-col
        overflow-hidden
        border-r
        border-gray-200
        bg-white
        shadow-sm
        lg:flex
      "
      aria-label="Dashboard navigation"
    >
      {/* Header */}
      <div
        className="
          shrink-0
          border-b
          border-gray-200
          px-6
          py-6
        "
      >
        <h1 className="text-xl font-bold text-gray-900">
          Users Dashboard
        </h1>
      </div>

      {/* Scrollable Navigation */}
      <nav
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-4
          py-6
        "
      >
        {/* Overview */}
        <div className="mb-6">
          <DashboardNavItem
            href="/users-dashboard"
            icon="🏠"
            label="Overview"
          />
        </div>

        {/* Stories */}
        <div className="mb-8">
          <button
            type="button"
            className="
              mb-3
              flex
              w-full
              items-center
              justify-between
              rounded-md
              px-2
              py-2
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-100
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <span>Stories</span>
            <span aria-hidden="true">▼</span>
          </button>

          <div className="space-y-2 pl-2">
            <DashboardNavItem
              href="/users-dashboard/my-stories"
              icon="📚"
              label="My Stories (Published)"
            />

            <DashboardNavItem
              href="/users-dashboard/write-story"
              icon="✍️"
              label="Write Story"
            />

            <DashboardNavItem
              href="/users-dashboard/pending-review"
              icon="⏳"
              label="Pending Review"
            />

            <DashboardNavItem
              href="/users-dashboard/drafts"
              icon="📝"
              label="Drafts"
            />
          </div>
        </div>

        {/* Saved */}
        <div className="mb-8">
          <button
            type="button"
            className="
              mb-3
              flex
              w-full
              items-center
              justify-between
              rounded-md
              px-2
              py-2
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-100
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <span>Saved</span>
            <span aria-hidden="true">▼</span>
          </button>

          <div className="space-y-2 pl-2">
            <DashboardNavItem
              href="/users-dashboard/bookmarks"
              icon="🔖"
              label="Bookmarks"
            />
          </div>
        </div>

        {/* Account */}
        <div>
          <button
            type="button"
            className="
              mb-3
              flex
              w-full
              items-center
              justify-between
              rounded-md
              px-2
              py-2
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-100
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <span>Account</span>
            <span aria-hidden="true">▼</span>
          </button>

          <div className="space-y-2 pl-2">
            <DashboardNavItem
              href="/users-dashboard/profile"
              icon="👤"
              label="Profile"
            />

            <DashboardNavItem
              href="/users-dashboard/settings"
              icon="⚙️"
              label="Settings"
            />
          </div>
        </div>
      </nav>

      {/* Logout — permanently visible */}
      <div
        className="
          shrink-0
          border-t
          border-gray-200
          bg-white
          p-4
        "
      >
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-4
            py-3
            text-sm
            font-medium
            text-gray-700
            transition-all
            duration-200
            hover:bg-red-50
            hover:text-red-600
            focus:outline-none
            focus:ring-2
            focus:ring-red-500
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <span className="flex h-5 w-5 items-center justify-center">
            {loggingOut ? "⏳" : "🚪"}
          </span>

          <span>
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
          }
