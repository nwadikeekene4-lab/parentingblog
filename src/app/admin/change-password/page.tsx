import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

import AdminChangePasswordForm from "./AdminChangePasswordForm";

export default async function AdminChangePasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (user.role !== "admin") {
    redirect("/users-dashboard");
  }

  return <AdminChangePasswordForm />;
}
