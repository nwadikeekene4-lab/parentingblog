import { NextResponse } from "next/server";
import {
  and,
  count,
  desc,
  eq,
} from "drizzle-orm";

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
| Fetch all notifications belonging to the
| currently logged-in user.
|
| Also returns the unread notification count.
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
    | 2. Fetch notifications
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
    | 3. Count unread notifications in the database
    |--------------------------------------------------------------------------
    |
    | This is more efficient than fetching everything and
    | counting unread notifications in JavaScript.
    |--------------------------------------------------------------------------
    */

    const [
      unreadResult,
    ] =
      await db
        .select({
          count:
            count(
              notifications.id
            ),
        })

        .from(
          notifications
        )

        .where(
          and(
            eq(
              notifications.userId,
              user.id
            ),

            eq(
              notifications.isRead,
              false
            )
          )
        );


    const unreadCount =
      Number(
        unreadResult?.count ?? 0
      );


    /*
    |--------------------------------------------------------------------------
    | 4. Return data
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
| PATCH — MARK NOTIFICATION(S) AS READ
|--------------------------------------------------------------------------
|
| Supports two modes.
|
| 1. Mark ONE notification:
|
|    PATCH
|    {
|      "notificationId": "..."
|    }
|
| 2. Mark ALL notifications:
|
|    PATCH
|    {
|      "markAll": true
|    }
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request
) {
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
    | 2. Read request body
    |--------------------------------------------------------------------------
    */

    let body:
      | {
          notificationId?: unknown;
          markAll?: unknown;
        }
      | null = null;


    try {
      body =
        await request.json();
    } catch {
      body = null;
    }


    /*
    |--------------------------------------------------------------------------
    | 3. Mark one notification
    |--------------------------------------------------------------------------
    */

    const notificationId =
      typeof body?.notificationId ===
      "string"
        ? body.notificationId.trim()
        : "";


    if (notificationId) {

      const updatedNotification =
        await db
          .update(
            notifications
          )

          .set({
            isRead:
              true,
          })

          .where(
            and(

              eq(
                notifications.id,
                notificationId
              ),

              /*
              | Security:
              | The notification must belong
              | to the currently logged-in user.
              */

              eq(
                notifications.userId,
                user.id
              ),

              /*
              | Avoid unnecessary database
              | updates for already-read rows.
              */

              eq(
                notifications.isRead,
                false
              )

            )
          )

          .returning({
            id:
              notifications.id,

            isRead:
              notifications.isRead,
          });


      /*
      |--------------------------------------------------------------------------
      | Notification wasn't found or wasn't owned by this user.
      |--------------------------------------------------------------------------
      */

      if (
        updatedNotification.length ===
        0
      ) {

        /*
        | Check whether the notification
        | actually belongs to the user.
        |
        | This lets us distinguish an already-read
        | notification from an unauthorized ID
        | without exposing another user's data.
        */

        const existingNotification =
          await db
            .select({
              id:
                notifications.id,

              isRead:
                notifications.isRead,
            })

            .from(
              notifications
            )

            .where(
              and(

                eq(
                  notifications.id,
                  notificationId
                ),

                eq(
                  notifications.userId,
                  user.id
                )

              )
            )

            .limit(1);


        if (
          existingNotification.length ===
          0
        ) {

          return NextResponse.json(
            {
              message:
                "Notification not found.",
            },
            {
              status: 404,
            }
          );

        }


        return NextResponse.json(
          {
            message:
              "Notification is already read.",

            notification:
              existingNotification[0],
          },
          {
            status: 200,
          }
        );

      }


      return NextResponse.json(
        {
          message:
            "Notification marked as read.",

          notification:
            updatedNotification[0],
        },
        {
          status: 200,
        }
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 4. Mark all notifications as read
    |--------------------------------------------------------------------------
    */

    if (
      body?.markAll === true ||
      body === null
    ) {

      await db
        .update(
          notifications
        )

        .set({
          isRead:
            true,
        })

        .where(
          and(

            eq(
              notifications.userId,
              user.id
            ),

            eq(
              notifications.isRead,
              false
            )

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
    }


    /*
    |--------------------------------------------------------------------------
    | 5. Invalid PATCH request
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Provide notificationId or markAll: true.",
      },
      {
        status: 400,
      }
    );


  } catch (error) {

    console.error(
      "Mark notification as read error:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to mark notification as read.",
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
    | 2. Delete ONLY this user's notifications
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
