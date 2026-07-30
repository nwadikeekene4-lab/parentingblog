
export default function UsersDashboardPage() {
  return (
    <div className="space-y-8">

      {/* Greeting */}
      <section>
        <h1 className="text-2xl font-bold text-gray-900">
          Good Morning 👋
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Welcome back. Here's what's happening with your stories today.
        </p>
      </section>

      {/* Statistics */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Published Stories
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Drafts
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Bookmarks
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Notifications
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

      </section>

      {/* Quick Actions */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold">
          Quick Actions
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">

          <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
            Write Story
          </button>

          <button className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-gray-100">
            My Stories
          </button>

          <button className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-gray-100">
            Bookmarks
          </button>

        </div>

      </section>

      {/* Recent Activity */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold">
          Recent Activity
        </h2>

        <div className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
          No recent activity yet.
        </div>

      </section>

    </div>
  );
}
