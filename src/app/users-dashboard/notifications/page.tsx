"use client";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Welcome to Parenting Blog!",
      message:
        "Thanks for joining our community. Start sharing your parenting journey today.",
      time: "Just now",
      unread: true,
    },
    {
      id: 2,
      title: "No new activity",
      message:
        "When people like, comment on, or bookmark your stories, you'll see updates here.",
      time: "Today",
      unread: false,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}

      <section>

        <h1 className="text-3xl font-bold text-gray-900">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Stay updated with everything happening on your account.
        </p>

      </section>

      {/* Notifications */}

      <section className="space-y-4">

        {notifications.map((notification) => (

          <article
            key={notification.id}
            className={`rounded-2xl border p-5 shadow-sm transition ${
              notification.unread
                ? "border-blue-200 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {notification.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {notification.message}
                </p>

              </div>

              {notification.unread && (
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  New
                </span>
              )}

            </div>

            <p className="mt-4 text-xs text-gray-500">
              {notification.time}
            </p>

          </article>

        ))}

      </section>

      {/* Actions */}

      <section className="flex flex-wrap gap-4">

        <button
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Mark All as Read
        </button>

        <button
          className="rounded-xl border border-red-500 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        >
          Clear Notifications
        </button>

      </section>

    </div>
  );
}
