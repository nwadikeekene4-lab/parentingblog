import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { stories, categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

type PendingReviewPageProps = {
  searchParams?: Promise<{
    submitted?: string;
  }>;
};

export default async function PendingReviewPage({
  searchParams,
}: PendingReviewPageProps) {
  const params = await searchParams;

  const submitted = params?.submitted === "true";

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const pendingStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      coverImage: stories.coverImage,
      createdAt: stories.createdAt,
      category: categories.name,
    })
    .from(stories)
    .innerJoin(
      categories,
      eq(stories.categoryId, categories.id)
    )
    .where(
      and(
        eq(stories.authorId, user.id),
        eq(stories.status, "pending_review"),
        eq(stories.isDeleted, false)
      )
    )
    .orderBy(desc(stories.createdAt));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Pending Review
        </h1>

        <p className="mt-2 text-gray-600">
          Stories you have submitted that are waiting for administrator approval.
        </p>
      </header>

      {submitted && (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-green-900">
            ✅ Story submitted successfully
          </h2>

          <p className="mt-3 text-green-800">
            Your story has been sent for review.
            Only you and administrators can view it while it is awaiting approval.
            After an administrator approves it, it will automatically appear in{" "}
            <strong>My Stories (Published)</strong> and become visible to visitors.
          </p>
        </section>
      )}

      {pendingStories.length === 0 ? (
        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-yellow-900">
            No stories are currently awaiting review
          </h2>

          <p className="mt-3 max-w-2xl text-yellow-800">
            After you publish a story, it will appear here while an administrator
            reviews it. During this stage, only you and administrators can access
            it. Visitors cannot see it until it has been approved.
          </p>

          <Link
            href="/users-dashboard/write-story"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Write a Story
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pendingStories.map((story) => (
            <article
              key={story.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src="/images/loginimage.png"
                    alt="Story cover"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    Pending Review
                  </span>

                  <span className="text-sm text-gray-500">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="line-clamp-2 text-xl font-bold text-gray-900">
                  {story.title}
                </h2>

                <p className="text-sm font-medium text-blue-600">
                  {story.category}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
  href={`/users-dashboard/edit-story/${story.id}`}
  aria-label={`Edit ${story.title}`}
  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0 active:scale-95 active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
>
  Edit Story
</Link>
                  <Link
  href={`/stories/${story.slug}`}
  aria-label={`Preview ${story.title}`}
  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:translate-y-0 active:scale-95 active:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
>
  Preview Story
</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
             }
