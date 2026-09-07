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

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
