"use client";

import DashboardNavItem from "./DashboardNavItem";

export default function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-gray-200 bg-white shadow-sm lg:flex">

      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-6">
        <h1 className="text-xl font-bold text-gray-900">
          Users Dashboard
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

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
            className="mb-3 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            <span>Stories</span>
            <span>▼</span>
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
            className="mb-3 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            <span>Saved</span>
            <span>▼</span>
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
            className="mb-3 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            <span>Account</span>
            <span>▼</span>
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

      </div>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">

        <DashboardNavItem
          href="/logout"
          icon="🚪"
          label="Logout"
        />

      </div>

    </aside>
  );
}
