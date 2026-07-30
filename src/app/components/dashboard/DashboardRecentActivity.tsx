import DashboardSectionTitle from "./DashboardSectionTitle";

export default function DashboardRecentActivity() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <DashboardSectionTitle
        title="Recent Activity"
        subtitle="Your latest actions will appear here."
      />

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">

        <div className="text-5xl">
          📜
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No recent activity yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          When you publish stories, edit them, receive comments,
          bookmarks or notifications, they'll appear here.
        </p>

      </div>

    </section>
  );
}
