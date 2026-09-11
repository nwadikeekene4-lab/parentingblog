import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

import DashboardShell from "../components/dashboard/DashboardShell";

export default async function UsersDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  /*
   * Admin accounts belong in the Admin Dashboard.
   *
   * Keep the existing behavior for other roles unchanged.
   */
  if (user.role === "admin") {
    redirect("/admin");
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
