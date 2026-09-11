import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const VISITOR_COOKIE = "pb_visitor_id";

function getVisitDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    /*
     * Administrators and moderators are never counted
     * as public-page visitors.
     */
    if (
      currentUser &&
      (currentUser.role === "admin" ||
        currentUser.role === "moderator")
    ) {
      return NextResponse.json(
        {
          success: true,
          counted: false,
        },
        { status: 200 }
      );
    }

    const visitDate = getVisitDate();
    const cookieStore = await cookies();

    /*
     * Registered users are identified by their
     * authenticated user ID.
     */
    if (currentUser) {
      await db
        .insert(visitorAnalytics)
        .values({
          userId: currentUser.id,
          visitorId: null,
          visitDate,
        })
        .onConflictDoNothing({
          target: [
            visitorAnalytics.userId,
            visitorAnalytics.visitDate,
          ],
        });

      return NextResponse.json(
        {
          success: true,
          counted: true,
          visitorType: "registered",
        },
        { status: 200 }
      );
    }

    /*
     * Anonymous visitors are identified using a
     * random first-party cookie.
     */
    const existingVisitorId =
      cookieStore.get(VISITOR_COOKIE)?.value ?? null;

    /*
     * Never trust arbitrary cookie contents.
     *
     * We only accept UUID-shaped values. If the cookie
     * is missing or malformed, create a new identifier.
     */
    const validVisitorId =
      existingVisitorId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existingVisitorId
      );

    /*
     * At this point visitorId is guaranteed to be a
     * string, which also satisfies the cookie API type.
     */
    const visitorId: string =
      validVisitorId
        ? existingVisitorId
        : crypto.randomUUID();

    await db
      .insert(visitorAnalytics)
      .values({
        userId: null,
        visitorId,
        visitDate,
      })
      .onConflictDoNothing({
        target: [
          visitorAnalytics.visitorId,
          visitorAnalytics.visitDate,
        ],
      });

    const response = NextResponse.json(
      {
        success: true,
        counted: true,
        visitorType: "unregistered",
      },
      { status: 200 }
    );

    /*
     * Only set the cookie when a new visitor ID
     * was generated.
     *
     * The visitor ID is:
     * - HttpOnly
     * - Secure in production
     * - SameSite=Lax
     * - Available site-wide
     * - Long-lived so returning visitors remain
     *   recognizable across different days.
     */
    if (!validVisitorId) {
      response.cookies.set({
        name: VISITOR_COOKIE,
        value: visitorId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 2,
      });
    }

    return response;
  } catch (error) {
    console.error(
      "Visitor tracking error:",
      error
    );

    /*
     * Visitor analytics must never prevent the
     * public Stories page from functioning.
     */
    return NextResponse.json(
      {
        success: false,
        counted: false,
      },
      { status: 200 }
    );
  }
      }
