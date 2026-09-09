import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  storyRevisions,
  storyRevisionImages,
  categories,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

type PreviewPageProps = {
  params: Promise<{
    revisionId: string;
  }>;
};

export default async function PendingRevisionPreviewPage({
  params,
}: PreviewPageProps) {
  const { revisionId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [revision] = await db
    .select({
      id: storyRevisions.id,
      storyId: storyRevisions.storyId,
      title: storyRevisions.title,
      slug: storyRevisions.slug,
      excerpt: storyRevisions.excerpt,
      content: storyRevisions.content,
      coverImage: storyRevisions.coverImage,
      category: categories.name,
      status: storyRevisions.status,
      createdAt: storyRevisions.createdAt,
    })
    .from(storyRevisions)
    .innerJoin(
      categories,
      eq(storyRevisions.categoryId, categories.id)
    )
    .where(
      and(
        eq(storyRevisions.id, revisionId),
        eq(storyRevisions.authorId, user.id),
        eq(storyRevisions.status, "pending_review")
      )
    )
    .limit(1);

  if (!revision) {
    notFound();
  }

  const revisionImages = await db
    .select({
      id: storyRevisionImages.id,
      imageUrl: storyRevisionImages.imageUrl,
      caption: storyRevisionImages.caption,
    })
    .from(storyRevisionImages)
    .where(eq(storyRevisionImages.revisionId, revision.id))
    .orderBy(asc(storyRevisionImages.displayOrder));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
              Preview — Pending Administrator Approval
            </span>

            <h1 className="mt-3 text-2xl font-bold text-yellow-900">
              This is your submitted revision
            </h1>

            <p className="mt-2 text-yellow-800">
              This preview shows exactly what you submitted for review.
              Your currently published story remains unchanged until an
              administrator approves these changes.
            </p>
          </div>

          <Link
            href="/users-dashboard/pending-review"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-yellow-300 bg-white px-5 py-2.5 font-semibold text-yellow-900 transition hover:bg-yellow-100"
          >
            Back to Pending Review
          </Link>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {revision.coverImage && (
          <div className="relative h-72 w-full overflow-hidden bg-gray-100 md:h-96">
            <img
              src={revision.coverImage}
              alt={revision.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6 p-6 md:p-10">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {revision.category}
            </p>

            <h2 className="mt-2 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              {revision.title}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Submitted for review on{" "}
              {new Date(revision.createdAt).toLocaleDateString()}
            </p>
          </div>

          {revision.excerpt && (
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-lg leading-relaxed text-gray-700">
                {revision.excerpt}
              </p>
            </div>
          )}

          <div className="prose prose-lg max-w-none text-gray-800">
            {revision.content.split("\n").map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} className="mb-5 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ) : null
            )}
          </div>

          {revisionImages.length > 0 && (
            <div className="space-y-6 border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Story Images
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {revisionImages.map((image) => (
                  <figure
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-gray-200"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.caption || revision.title}
                      className="h-64 w-full object-cover"
                    />

                    {image.caption && (
                      <figcaption className="p-4 text-sm text-gray-600">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <div className="flex justify-center pb-8">
        <Link
          href={`/users-dashboard/edit-story/${revision.storyId}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Edit Submitted Changes
        </Link>
      </div>
    </div>
  );
}
