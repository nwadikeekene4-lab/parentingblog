import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

import EditStoryForm from "./components/EditStoryForm";

type EditStoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStoryPage({
  params,
}: EditStoryPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="space-y-8">

      {/* Page Header */}

      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">

        <h1 className="text-3xl font-bold">
          Edit Story
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100">
          Make changes to your story before it is reviewed
          by an administrator.
        </p>

      </section>

      {/* Independent Edit Form */}

      <EditStoryForm storyId={id} />

    </div>
  );
    }
