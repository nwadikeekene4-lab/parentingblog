import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  comments,
  storyBookmarks,
  notifications,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

import DashboardSectionTitle from "./DashboardSectionTitle";


type Activity = {
  id: string;
  type: "story" | "comment" | "bookmark" | "notification";
  message: string;
  createdAt: Date;
};


export default async function DashboardRecentActivity() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Get the user's recent stories
  |--------------------------------------------------------------------------
  */

  const recentStories =
    await db
      .select({
        id: stories.id,
        title: stories.title,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
        status: stories.status,
      })
      .from(stories)
      .where(
        and(
          eq(
            stories.authorId,
            user.id
          ),
          eq(
            stories.isDeleted,
            false
          )
        )
      )
      .orderBy(
        desc(
          stories.updatedAt
        )
      )
      .limit(5);


  /*
  |--------------------------------------------------------------------------
  | Get the user's story IDs
  |--------------------------------------------------------------------------
  */

  const storyIds =
    recentStories.map(
      (story) => story.id
    );


  /*
  |--------------------------------------------------------------------------
  | Get recent comments on the user's stories
  |--------------------------------------------------------------------------
  */

  const recentComments =
    storyIds.length > 0
      ? await db
          .select({
            id: comments.id,
            storyId: comments.storyId,
            createdAt: comments.createdAt,
          })
          .from(comments)
          .where(
            and(
              inArray(
                comments.storyId,
                storyIds
              ),
              eq(
                comments.isDeleted,
                false
              ),
              eq(
                comments.isApproved,
                true
              )
            )
          )
          .orderBy(
            desc(
              comments.createdAt
            )
          )
          .limit(5)
      : [];


  /*
  |--------------------------------------------------------------------------
  | Get recent bookmarks on the user's stories
  |--------------------------------------------------------------------------
  */

  const recentBookmarks =
    storyIds.length > 0
      ? await db
          .select({
            id: storyBookmarks.id,
            storyId:
              storyBookmarks.storyId,
            createdAt:
              storyBookmarks.createdAt,
          })
          .from(storyBookmarks)
          .where(
            inArray(
              storyBookmarks.storyId,
              storyIds
            )
          )
          .orderBy(
            desc(
              storyBookmarks.createdAt
            )
          )
          .limit(5)
      : [];


  /*
  |--------------------------------------------------------------------------
  | Get recent notifications
  |--------------------------------------------------------------------------
  */

  const recentNotifications =
    await db
      .select({
        id: notifications.id,
        message:
          notifications.message,
        createdAt:
          notifications.createdAt,
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
      )
      .limit(5);


  /*
  |--------------------------------------------------------------------------
  | Convert everything into one activity list
  |--------------------------------------------------------------------------
  */

  const activities: Activity[] = [];


  recentStories.forEach(
    (story) => {

      activities.push({
        id:
          `story-${story.id}`,

        type:
          "story",

        message:
          story.status === "published"
            ? `You published "${story.title}".`
            : `You edited "${story.title}".`,

        createdAt:
          story.updatedAt,

      });

    }
  );


  recentComments.forEach(
    (comment) => {

      const story =
        recentStories.find(
          (item) =>
            item.id ===
            comment.storyId
        );


      activities.push({
        id:
          `comment-${comment.id}`,

        type:
          "comment",

        message:
          story
            ? `Your story "${story.title}" received a comment.`
            : "One of your stories received a comment.",

        createdAt:
          comment.createdAt,

      });

    }
  );


  recentBookmarks.forEach(
    (bookmark) => {

      const story =
        recentStories.find(
          (item) =>
            item.id ===
            bookmark.storyId
        );


      activities.push({
        id:
          `bookmark-${bookmark.id}`,

        type:
          "bookmark",

        message:
          story
            ? `"${story.title}" was bookmarked.`
            : "One of your stories was bookmarked.",

        createdAt:
          bookmark.createdAt,

      });

    }
  );


  recentNotifications.forEach(
    (notification) => {

      activities.push({
        id:
          `notification-${notification.id}`,

        type:
          "notification",

        message:
          notification.message,

        createdAt:
          notification.createdAt,

      });

    }
  );


  /*
  |--------------------------------------------------------------------------
  | Sort everything by newest first
  |--------------------------------------------------------------------------
  */

  activities.sort(
    (a, b) =>
      new Date(
        b.createdAt
      ).getTime() -
      new Date(
        a.createdAt
      ).getTime()
  );


  const latestActivities =
    activities.slice(0, 5);


  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <DashboardSectionTitle
        title="Recent Activity"
        subtitle="Your latest actions will appear here."
      />


      {latestActivities.length === 0 ? (

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">

          <div className="text-5xl">
            📜
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No recent activity yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            When you publish stories, edit them, receive comments,
            bookmarks or notifications, they'll appear here.
          </p>

        </div>

      ) : (

        <div className="mt-5 space-y-3">

          {latestActivities.map(
            (activity) => (

              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">

                  {activity.type === "story" && "📚"}

                  {activity.type === "comment" && "💬"}

                  {activity.type === "bookmark" && "🔖"}

                  {activity.type === "notification" && "🔔"}

                </div>


                <div className="min-w-0">

                  <p className="text-sm font-medium text-gray-800">
                    {activity.message}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </section>
  );
            }
