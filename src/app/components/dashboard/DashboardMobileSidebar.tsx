"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DashboardNavItem from "./DashboardNavItem";

type DashboardMobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DashboardMobileSidebar({
  isOpen,
  onClose,
}: DashboardMobileSidebarProps) {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  if (!isOpen) return null;

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

      onClose();

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
    <>
      {/* Backdrop */}
      <div
        className="
          fixed
          inset-0
          z-40
          bg-black/40
          lg:hidden
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-50
          flex
          h-dvh
          w-72
          flex-col
          overflow-hidden
          bg-white
          shadow-2xl
          lg:hidden
        "
        aria-label="Mobile dashboard navigation"
      >
        {/* Header */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-200
            px-6
            py-5
          "
        >
          <h2 className="text-lg font-bold text-gray-900">
            Users Dashboard
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dashboard menu"
            className="
              rounded-lg
              p-2
              text-xl
              text-gray-600
              transition
              hover:bg-gray-100
              hover:text-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            ✕
          </button>
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
          <DashboardNavItem
            href="/users-dashboard"
            icon="🏠"
            label="Overview"
            onClick={onClose}
          />

          {/* Stories */}
          <div className="mt-8">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Stories
            </p>

            <div className="space-y-2">
              <DashboardNavItem
                href="/users-dashboard/my-stories"
                icon="📚"
                label="My Stories (Published)"
                onClick={onClose}
              />

              <DashboardNavItem
                href="/users-dashboard/write-story"
                icon="✍️"
                label="Write Story"
                onClick={onClose}
              />

              <DashboardNavItem
                href="/users-dashboard/pending-review"
                icon="⏳"
                label="Pending Review"
                onClick={onClose}
              />

              <DashboardNavItem
                href="/users-dashboard/drafts"
                icon="📝"
                label="Drafts"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Saved */}
          <div className="mt-8">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Saved
            </p>

            <DashboardNavItem
              href="/users-dashboard/bookmarks"
              icon="🔖"
              label="Bookmarks"
              onClick={onClose}
            />
          </div>

          {/* Account */}
          <div className="mt-8">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Account
            </p>

            <div className="space-y-2">
              <DashboardNavItem
                href="/users-dashboard/profile"
                icon="👤"
                label="Profile"
                onClick={onClose}
              />

              <DashboardNavItem
                href="/users-dashboard/settings"
                icon="⚙️"
                label="Settings"
                onClick={onClose}
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
            pb-[max(1rem,env(safe-area-inset-bottom))]
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
    </>
  );
}
