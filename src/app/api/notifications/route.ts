import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";

import {
  notifications,
} from "@/db/schema";

import {
  getCurrentUser,
} from "@/lib/session";


/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
| Fetch all notifications belonging to the currently logged-in user.
|
| Each notification includes:
| - link       → where the notification should navigate
| - storyId    → related story
| - commentId  → related comment/reply
|--------------------------------------------------------------------------
*/

export async function GET() {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Get current user
    |--------------------------------------------------------------------------
    */

    const user =
      await getCurrentUser();


    if (!user) {

      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 2. Fetch user's notifications
    |--------------------------------------------------------------------------
    */

    const userNotifications =
      await db
        .select({

          id:
            notifications.id,

          type:
            notifications.type,

          message:
            notifications.message,

          link:
            notifications.link,

          storyId:
            notifications.storyId,

          commentId:
            notifications.commentId,

          isRead:
            notifications.isRead,

          createdAt:
            notifications.createdAt,

        })

        .from(
          notifications
        )

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


    /*
    |--------------------------------------------------------------------------
    | 3. Count unread notifications
    |--------------------------------------------------------------------------
    */

    const unreadCount =
      userNotifications.filter(
        (
          notification
        ) =>
          !notification.isRead
      ).length;


    /*
    |--------------------------------------------------------------------------
    | 4. Return notifications
    |--------------------------------------------------------------------------
    */

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
| PATCH — MARK ALL AS READ
|--------------------------------------------------------------------------
*/

export async function PATCH() {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Get current user
    |--------------------------------------------------------------------------
    */

    const user =
      await getCurrentUser();


    if (!user) {

      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 2. Mark only this user's notifications as read
    |--------------------------------------------------------------------------
    */

    await db
      .update(
        notifications
      )

      .set({
        isRead:
          true,
      })

      .where(
        eq(
          notifications.userId,
          user.id
        )
      );


    /*
    |--------------------------------------------------------------------------
    | 3. Success
    |--------------------------------------------------------------------------
    */

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
| DELETE — CLEAR ALL NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export async function DELETE() {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Get current user
    |--------------------------------------------------------------------------
    */

    const user =
      await getCurrentUser();


    if (!user) {

      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }


    /*
    |--------------------------------------------------------------------------
    | 2. Delete only this user's notifications
    |--------------------------------------------------------------------------
    */

    await db
      .delete(
        notifications
      )

      .where(
        eq(
          notifications.userId,
          user.id
        )
      );


    /*
    |--------------------------------------------------------------------------
    | 3. Success
    |--------------------------------------------------------------------------
    */

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
