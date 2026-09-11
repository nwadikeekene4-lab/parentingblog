"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type VisitorStats = {
  total: number;
  registered: number;
  unregistered: number;
};

type DailyVisitor = {
  date: string;
  total: number;
  registered: number;
  unregistered: number;
};

type VisitorsResponse = {
  success: boolean;
  timezone: string;

  today: VisitorStats & {
    date: string;
  };

  yesterday: VisitorStats & {
    date: string;
  };

  last7Days: VisitorStats;
  last30Days: VisitorStats;
  allTime: VisitorStats;

  daily: DailyVisitor[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(
    value
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(
    new Date(`${date}T12:00:00`)
  );
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(
    new Date(`${date}T12:00:00`)
  );
}

function percentage(
  value: number,
  total: number
) {
  if (!total) return 0;

  return Math.round(
    (value / total) * 100
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />

      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminVisitorsPage() {
  const [data, setData] =
    useState<VisitorsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  async function loadVisitors(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/visitors",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (response.status === 403) {
        setError(
          "You do not have permission to view visitor analytics."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load visitor analytics."
        );
      }

      const result =
        (await response.json()) as VisitorsResponse;

      if (!result.success) {
        throw new Error(
          "Unable to load visitor analytics."
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Admin visitors page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load visitor analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadVisitors();
  }, []);

  const maxDailyVisitors = useMemo(() => {
    if (!data?.daily.length) return 1;

    return Math.max(
      ...data.daily.map(
        (item) => item.total
      ),
      1
    );
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-9 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-5 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <LoadingSkeleton />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-900">
              Unable to load visitor analytics
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "Something went wrong while loading the analytics."}
            </p>

            <button
              type="button"
              onClick={() =>
                loadVisitors(true)
              }
              className="mt-5 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const todayRegisteredPercentage =
    percentage(
      data.today.registered,
      data.today.total
    );

  const todayUnregisteredPercentage =
    percentage(
      data.today.unregistered,
      data.today.total
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Back to Admin Dashboard
              </Link>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Visitor Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Track unique visitors to the public
                Stories page and see the daily
                difference between registered and
                unregistered visitors.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadVisitors(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
            Daily visitor dates use{" "}
            <span className="font-semibold text-gray-700">
              Africa/Lagos
            </span>{" "}
            time.
          </div>
        </div>

        {/* Main KPI cards */}
        <section aria-label="Visitor overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Visitors Today"
              value={data.today.total}
              description="Unique visitors today"
              icon="👥"
            />

            <StatCard
              title="Registered Today"
              value={data.today.registered}
              description="Registered visitors"
              icon="✓"
            />

            <StatCard
              title="Unregistered Today"
              value={
                data.today.unregistered
              }
              description="Anonymous visitors"
              icon="◉"
            />

            <StatCard
              title="Last 30 Days"
              value={data.last30Days.total}
              description="Unique visitor-days"
              icon="📊"
            />
          </div>
        </section>

        {/* Today breakdown */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Today&apos;s visitor breakdown
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {formatFullDate(
                  data.today.date
                )}
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-700">
              {formatNumber(
                data.today.total
              )}{" "}
              total visitors
            </p>
          </div>

          <div className="mt-6">
            <div className="h-4 overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full w-full">
                <div
                  className="h-full bg-gray-900 transition-all"
                  style={{
                    width: `${todayRegisteredPercentage}%`,
                  }}
                />

                <div
                  className="h-full bg-gray-300 transition-all"
                  style={{
                    width: `${todayUnregisteredPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-900" />

                    <span className="text-sm font-medium text-gray-700">
                      Registered
                    </span>
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {todayRegisteredPercentage}%
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatNumber(
                    data.today.registered
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-300" />

                    <span className="text-sm font-medium text-gray-700">
                      Unregistered
                    </span>
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {todayUnregisteredPercentage}%
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatNumber(
                    data.today.unregistered
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Daily chart */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Daily visitors
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Unique visitors recorded over the
              last 30 days.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              <div className="flex h-64 items-end gap-2 border-b border-gray-200 px-2">
                {data.daily.map(
                  (item) => {
                    const height =
                      item.total === 0
                        ? 2
                        : Math.max(
                            Math.round(
                              (item.total /
                                maxDailyVisitors) *
                                100
                            ),
                            5
                          );

                    return (
                      <div
                        key={item.date}
                        className="group flex h-full min-w-[20px] flex-1 flex-col justify-end"
                        title={`${formatFullDate(
                          item.date
                        )}: ${formatNumber(
                          item.total
                        )} visitors`}
                      >
                        <div className="relative flex h-full items-end justify-center">
                          <div
                            className="w-full max-w-7 rounded-t-md bg-gray-900 transition-opacity group-hover:opacity-70"
                            style={{
                              height: `${height}%`,
                            }}
                          >
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                              {formatNumber(
                                item.total
                              )}{" "}
                              visitors
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-3 flex gap-2 px-2">
                {data.daily.map(
                  (item, index) => (
                    <div
                      key={item.date}
                      className="min-w-[20px] flex-1 text-center text-[10px] text-gray-400"
                    >
                      {index % 5 === 0 ||
                      index ===
                        data.daily.length -
                          1
                        ? formatDate(
                            item.date
                          )
                        : ""}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Period comparison */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Visitor periods
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Compare visitor activity across
              different periods.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Yesterday
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatNumber(
                  data.yesterday.total
                )}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Registered
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatNumber(
                      data.yesterday
                        .registered
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Unregistered
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatNumber(
                      data.yesterday
                        .unregistered
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Last 7 Days
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatNumber(
                  data.last7Days.total
                )}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Registered
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatNumber(
                      data.last7Days
                        .registered
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Unregistered
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatNumber(
                      data.last7Days
                        .unregistered
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                All Time
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatNumber(
                  data.allTime.total
                )}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Registered
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatNumber(
                      data.allTime.registered
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Unregistered
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatNumber(
                      data.allTime
                        .unregistered
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Daily table */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Daily breakdown
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Detailed visitor counts for the
              last 30 days.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Total
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Registered
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Unregistered
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Registered %
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {[...data.daily]
                  .reverse()
                  .map((item) => (
                    <tr
                      key={item.date}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {formatFullDate(
                          item.date
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-gray-900">
                        {formatNumber(
                          item.total
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-gray-700">
                        {formatNumber(
                          item.registered
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-gray-700">
                        {formatNumber(
                          item.unregistered
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-gray-700">
                        {percentage(
                          item.registered,
                          item.total
                        )}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Definition */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-gray-900">
            How visitor counting works
          </h2>

          <div className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
            <p>
              A visitor is counted when they land on
              the public Stories page.
            </p>

            <p>
              The same registered user or anonymous
              browser is counted only once per
              calendar day.
            </p>

            <p>
              Administrators and moderators are
              excluded from visitor analytics.
            </p>

            <p>
              Daily dates are calculated using
              Africa/Lagos time.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
                  }
                        
