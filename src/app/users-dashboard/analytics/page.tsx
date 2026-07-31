"use client";

export default function AnalyticsPage() {
  const stats = [
    {
      title: "Stories Published",
      value: 0,
      icon: "📚",
    },
    {
      title: "Total Views",
      value: 0,
      icon: "👁",
    },
    {
      title: "Total Likes",
      value: 0,
      icon: "❤️",
    },
    {
      title: "Comments Received",
      value: 0,
      icon: "💬",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}

      <section>

        <h1 className="text-3xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Monitor how your parenting stories are performing.
        </p>

      </section>

      {/* Statistics */}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => (

          <div
            key={stat.title}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >

            <div className="text-4xl">
              {stat.icon}
            </div>

            <h2 className="mt-4 text-sm font-medium text-gray-500">
              {stat.title}
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>

          </div>

        ))}

      </section>

      {/* Insights */}

      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">

        <div className="text-6xl">
          📈
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-gray-900">
          No analytics available yet
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
          Publish stories and engage with the community.
          Once readers start viewing, liking and commenting,
          your statistics will appear here.
        </p>

      </section>

    </div>
  );
}
