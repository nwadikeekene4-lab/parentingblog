import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";


/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| MARK ALL AS READ
|--------------------------------------------------------------------------
*/

export async function PATCH() {
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


    await db
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(
        eq(
          notifications.userId,
          user.id
        )
      );


    return NextResponse.json(
      {
        message:
          "All notifications marked as read.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Mark notifications as read error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to mark notifications as read.",
      },
      {
        status: 500,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| CLEAR ALL NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export async function DELETE() {
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


    await db
      .delete(notifications)
      .where(
        eq(
          notifications.userId,
          user.id
        )
      );


    return NextResponse.json(
      {
        message:
          "Notifications cleared successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Clear notifications error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to clear notifications.",
      },
      {
        status: 500,
      }
    );
  }
}
