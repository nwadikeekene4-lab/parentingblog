import Link from "next/link";

import DashboardSectionTitle from "./DashboardSectionTitle";

export default function DashboardQuickActions() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <DashboardSectionTitle
        title="Quick Actions"
        subtitle="Jump quickly to your most-used features."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <Link
          href="/users-dashboard/write-story"
          className="rounded-xl border border-blue-100 bg-blue-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-blue-100"
        >
          <div className="text-3xl">✍️</div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Write Story
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Share your parenting experience.
          </p>
        </Link>

        <Link
          href="/users-dashboard/my-stories"
          className="rounded-xl border border-green-100 bg-green-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-green-100"
        >
          <div className="text-3xl">📚</div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            My Stories
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            View and manage your published stories.
          </p>
        </Link>

        <Link
          href="/users-dashboard/bookmarks"
          className="rounded-xl border border-yellow-100 bg-yellow-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-yellow-100"
        >
          <div className="text-3xl">🔖</div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Bookmarks
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Continue reading your saved stories.
          </p>
        </Link>

      </div>

    </section>
  );
}
