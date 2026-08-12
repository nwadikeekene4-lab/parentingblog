import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import DashboardStatsCard from "../components/dashboard/DashboardStatsCard";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";

async function getDashboardStats() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/dashboard/stats`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        publishedStories: 0,
        drafts: 0,
        bookmarks: 0,
        notifications: 0,
      };
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Failed to fetch dashboard stats:",
      error
    );

    return {
      publishedStories: 0,
      drafts: 0,
      bookmarks: 0,
      notifications: 0,
    };
  }
}

export default async function UsersDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">

      <DashboardWelcome />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <DashboardStatsCard
          title="Published Stories"
          value={stats.publishedStories}
          icon={<span className="text-xl">📚</span>}
          color="blue"
        />

        <DashboardStatsCard
          title="Drafts"
          value={stats.drafts}
          icon={<span className="text-xl">📝</span>}
          color="yellow"
        />

        <DashboardStatsCard
          title="Bookmarks"
          value={stats.bookmarks}
          icon={<span className="text-xl">🔖</span>}
          color="green"
        />

        <DashboardStatsCard
          title="Notifications"
          value={stats.notifications}
          icon={<span className="text-xl">🔔</span>}
          color="red"
        />

      </section>

      <DashboardQuickActions />

      <DashboardRecentActivity />

    </div>
  );
      }
