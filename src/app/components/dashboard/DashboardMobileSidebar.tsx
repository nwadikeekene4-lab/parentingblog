"use client";

import DashboardNavItem from "./DashboardNavItem";

type DashboardMobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DashboardMobileSidebar({
  isOpen,
  onClose,
}: DashboardMobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-white shadow-xl lg:hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

          <h2 className="text-lg font-bold text-gray-900">
            Users Dashboard
          </h2>

          <button
            onClick={onClose}
            className="rounded-md p-2 text-xl hover:bg-gray-100"
          >
            ✕
          </button>

        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <DashboardNavItem
            href="/users-dashboard"
            icon="🏠"
            label="Overview"
            onClick={onClose}
          />

          <div className="mt-8">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
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

          <div className="mt-8">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Saved
            </p>

            <DashboardNavItem
              href="/users-dashboard/bookmarks"
              icon="🔖"
              label="Bookmarks"
              onClick={onClose}
            />

          </div>

          <div className="mt-8">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
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

        </div>

        {/* Logout */}

        <div className="border-t border-gray-200 p-4">

          <DashboardNavItem
            href="/logout"
            icon="🚪"
            label="Logout"
            onClick={onClose}
          />

        </div>

      </aside>
    </>
  );
}
