import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import DashboardStatsCard from "../components/dashboard/DashboardStatsCard";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";

export default function UsersDashboardPage() {
  return (
    <div className="space-y-8">

      <DashboardWelcome />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <DashboardStatsCard
          title="Published Stories"
          value={0}
          icon={<span className="text-xl">📚</span>}
          color="blue"
        />

        <DashboardStatsCard
          title="Drafts"
          value={0}
          icon={<span className="text-xl">📝</span>}
          color="yellow"
        />

        <DashboardStatsCard
          title="Bookmarks"
          value={0}
          icon={<span className="text-xl">🔖</span>}
          color="green"
        />

        <DashboardStatsCard
          title="Notifications"
          value={0}
          icon={<span className="text-xl">🔔</span>}
          color="red"
        />

      </section>

      <DashboardQuickActions />

      <DashboardRecentActivity />

    </div>
  );
}
