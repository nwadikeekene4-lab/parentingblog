import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

import EditStoryForm from "@/app/users-dashboard/edit-story/[id]/components/EditStoryForm";

type EditStoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditStoryPage({
  params,
}: EditStoryPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (user.role !== "admin") {
    redirect("/users-dashboard");
  }

  const { id } = await params;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Edit Published Story
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100">
          You are editing this published story as an administrator.
          Your changes will be applied directly when you save.
        </p>
      </section>

      <EditStoryForm storyId={id} />
    </div>
  );
    }
