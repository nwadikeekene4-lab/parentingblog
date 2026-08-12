import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";


export async function GET() {
  try {

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }


    const userNotifications =
      await db
        .select({
          id: notifications.id,
          type: notifications.type,
          message: notifications.message,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(
          eq(
            notifications.userId,
            user.id
          )
        )
        .orderBy(
          desc(
            notifications.createdAt
          )
        );


    const unreadCount =
      userNotifications.filter(
        (notification) =>
          !notification.isRead
      ).length;


    return NextResponse.json(
      {
        notifications:
          userNotifications,

        unreadCount,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Fetch notifications error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch notifications.",
      },
      {
        status: 500,
      }
    );
  }
          }
