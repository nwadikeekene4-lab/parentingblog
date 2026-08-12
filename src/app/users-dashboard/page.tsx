import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  stories,
  storyBookmarks,
  notifications,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import DashboardStatsCard from "../components/dashboard/DashboardStatsCard";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";


async function getDashboardStats(userId: string) {

  const [
    publishedStoriesResult,
    draftsResult,
    bookmarksResult,
    notificationsResult,
  ] = await Promise.all([

    /*
    |--------------------------------------------------------------------------
    | Published Stories
    |--------------------------------------------------------------------------
    | Only published stories belonging to the logged-in user.
    */

    db
      .select({
        count: count(),
      })
      .from(stories)
      .where(
        and(
          eq(stories.authorId, userId),
          eq(stories.status, "published"),
          eq(stories.isDeleted, false)
        )
      ),


    /*
    |--------------------------------------------------------------------------
    | Drafts
    |--------------------------------------------------------------------------
    | Drafts are stored in the stories table with status = "draft".
    | This is the same database source used by the drafts system.
    */

    db
      .select({
        count: count(),
      })
      .from(stories)
      .where(
        and(
          eq(stories.authorId, userId),
          eq(stories.status, "draft"),
          eq(stories.isDeleted, false)
        )
      ),


    /*
    |--------------------------------------------------------------------------
    | Bookmarks
    |--------------------------------------------------------------------------
    | Number of stories bookmarked by the logged-in user.
    */

    db
      .select({
        count: count(),
      })
      .from(storyBookmarks)
      .where(
        eq(
          storyBookmarks.userId,
          userId
        )
      ),


    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    | Number of notifications belonging to the logged-in user.
    */

    db
      .select({
        count: count(),
      })
      .from(notifications)
      .where(
        eq(
          notifications.userId,
          userId
        )
      ),

  ]);


  return {
    publishedStories:
      Number(
        publishedStoriesResult[0]?.count ?? 0
      ),

    drafts:
      Number(
        draftsResult[0]?.count ?? 0
      ),

    bookmarks:
      Number(
        bookmarksResult[0]?.count ?? 0
      ),

    notifications:
      Number(
        notificationsResult[0]?.count ?? 0
      ),
  };

}


export default async function UsersDashboardPage() {

  const user =
    await getCurrentUser();


  /*
  |--------------------------------------------------------------------------
  | If there is no logged-in user
  |--------------------------------------------------------------------------
  | The dashboard should normally already be protected by the dashboard
  | layout, but this prevents database queries from running without a user.
  */

  if (!user) {

    return null;

  }


  const stats =
    await getDashboardStats(user.id);


  return (
    <div className="space-y-8">

      <DashboardWelcome />


      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <DashboardStatsCard
          title="Published Stories"
          value={stats.publishedStories}
          icon={
            <span className="text-xl">
              📚
            </span>
          }
          color="blue"
        />


        <DashboardStatsCard
          title="Drafts"
          value={stats.drafts}
          icon={
            <span className="text-xl">
              📝
            </span>
          }
          color="yellow"
        />


        <DashboardStatsCard
          title="Bookmarks"
          value={stats.bookmarks}
          icon={
            <span className="text-xl">
              🔖
            </span>
          }
          color="green"
        />


        <DashboardStatsCard
          title="Notifications"
          value={stats.notifications}
          icon={
            <span className="text-xl">
              🔔
            </span>
          }
          color="red"
        />

      </section>


      <DashboardQuickActions />


      <DashboardRecentActivity />

    </div>
  );

}
