import { NextResponse } from "next/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

function getLagosDate(daysAgo = 0): string {
  const date = new Date();

  date.setDate(date.getDate() - daysAgo);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getLagosDateFromDate(
  date: Date
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getDateDaysAgo(
  days: number
): Date {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return date;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    const today = getLagosDate(0);
    const yesterday = getLagosDate(1);
    const sevenDaysAgo = getLagosDate(6);
    const thirtyDaysAgo = getLagosDate(29);

    /*
     * ------------------------------------------------------------
     * TODAY
     * ------------------------------------------------------------
     */

    const [todayStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        registered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.userId} is not null
          )::int
        `,
        unregistered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.visitorId} is not null
          )::int
        `,
      })
      .from(visitorAnalytics)
      .where(
        eq(
          visitorAnalytics.visitDate,
          today
        )
      );

    /*
     * ------------------------------------------------------------
     * YESTERDAY
     * ------------------------------------------------------------
     */

    const [yesterdayStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        registered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.userId} is not null
          )::int
        `,
        unregistered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.visitorId} is not null
          )::int
        `,
      })
      .from(visitorAnalytics)
      .where(
        eq(
          visitorAnalytics.visitDate,
          yesterday
        )
      );

    /*
     * ------------------------------------------------------------
     * LAST 7 DAYS
     * ------------------------------------------------------------
     */

    const [sevenDayStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        registered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.userId} is not null
          )::int
        `,
        unregistered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.visitorId} is not null
          )::int
        `,
      })
      .from(visitorAnalytics)
      .where(
        gte(
          visitorAnalytics.visitDate,
          sevenDaysAgo
        )
      );

    /*
     * ------------------------------------------------------------
     * LAST 30 DAYS
     * ------------------------------------------------------------
     */

    const [thirtyDayStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        registered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.userId} is not null
          )::int
        `,
        unregistered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.visitorId} is not null
          )::int
        `,
      })
      .from(visitorAnalytics)
      .where(
        gte(
          visitorAnalytics.visitDate,
          thirtyDaysAgo
        )
      );

    /*
     * ------------------------------------------------------------
     * ALL TIME
     * ------------------------------------------------------------
     */

    const [allTimeStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        registered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.userId} is not null
          )::int
        `,
        unregistered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.visitorId} is not null
          )::int
        `,
      })
      .from(visitorAnalytics);

    /*
     * ------------------------------------------------------------
     * DAILY BREAKDOWN
     *
     * We deliberately use the last 30 calendar days.
     * The frontend can render this efficiently without
     * requesting each day separately.
     * ------------------------------------------------------------
     */

    const thirtyDaysStart =
      getDateDaysAgo(29);

    const thirtyDaysStartString =
      getLagosDateFromDate(
        thirtyDaysStart
      );

    const dailyRows = await db
      .select({
        date: visitorAnalytics.visitDate,

        total: sql<number>`count(*)::int`,

        registered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.userId} is not null
          )::int
        `,

        unregistered: sql<number>`
          count(*) filter (
            where ${visitorAnalytics.visitorId} is not null
          )::int
        `,
      })
      .from(visitorAnalytics)
      .where(
        and(
          gte(
            visitorAnalytics.visitDate,
            thirtyDaysStartString
          ),
          lte(
            visitorAnalytics.visitDate,
            today
          )
        )
      )
      .groupBy(
        visitorAnalytics.visitDate
      )
      .orderBy(
        visitorAnalytics.visitDate
      );

    /*
     * Fill dates with zero values so the chart has a
     * complete 30-day timeline even when nobody visited
     * on one or more days.
     */

    const dailyMap = new Map(
      dailyRows.map((row) => [
        row.date,
        {
          total: row.total,
          registered: row.registered,
          unregistered:
            row.unregistered,
        },
      ])
    );

    const daily = [];

    for (let i = 29; i >= 0; i--) {
      const date = getLagosDate(i);

      const stats =
        dailyMap.get(date);

      daily.push({
        date,
        total: stats?.total ?? 0,
        registered:
          stats?.registered ?? 0,
        unregistered:
          stats?.unregistered ?? 0,
      });
    }

    return NextResponse.json(
      {
        success: true,

        timezone: "Africa/Lagos",

        today: {
          date: today,
          total: todayStats?.total ?? 0,
          registered:
            todayStats?.registered ?? 0,
          unregistered:
            todayStats?.unregistered ?? 0,
        },

        yesterday: {
          date: yesterday,
          total:
            yesterdayStats?.total ?? 0,
          registered:
            yesterdayStats?.registered ?? 0,
          unregistered:
            yesterdayStats?.unregistered ?? 0,
        },

        last7Days: {
          total:
            sevenDayStats?.total ?? 0,
          registered:
            sevenDayStats?.registered ?? 0,
          unregistered:
            sevenDayStats?.unregistered ?? 0,
        },

        last30Days: {
          total:
            thirtyDayStats?.total ?? 0,
          registered:
            thirtyDayStats?.registered ?? 0,
          unregistered:
            thirtyDayStats?.unregistered ?? 0,
        },

        allTime: {
          total:
            allTimeStats?.total ?? 0,
          registered:
            allTimeStats?.registered ?? 0,
          unregistered:
            allTimeStats?.unregistered ?? 0,
        },

        daily,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(
      "Admin visitors analytics GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load visitor analytics.",
      },
      { status: 500 }
    );
  }
}
