
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { stories } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import ReviewActions from "../ReviewActions";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AdminPendingReviewStoryPage({
  params,
}: Props) {
  const { slug } = await params;

  /*
   * ------------------------------------------------------------
   * ADMIN AUTHORIZATION
   * ------------------------------------------------------------
   */

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    notFound();
  }

  /*
   * ------------------------------------------------------------
   * LOAD STORY
   * ------------------------------------------------------------
   */

  const story = await db.query.stories.findFirst({
    where: eq(stories.slug, slug),

    with: {
      author: true,
      category: true,

      images: {
        orderBy: (images, { asc }) => [
          asc(images.displayOrder),
        ],
      },
    },
  });

  /*
   * Only pending stories should be accessible
   * through this review page.
   */

  if (
    !story ||
    story.isDeleted ||
    story.status !== "pending_review"
  ) {
    notFound();
  }

  /*
   * ------------------------------------------------------------
   * READING TIME
   * ------------------------------------------------------------
   */

  const words = story.content
    .trim()
    .split(/\s+/)
    .length;

  const readTime = Math.max(
    1,
    Math.ceil(words / 200)
  );

  /*
   * ------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------
   */

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      {/* Back */}

      <div className="mb-6">
        <Link
          href="/admin/pending-review"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            shadow-sm
            transition
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
          "
        >
          ← Back to Pending Review
        </Link>
      </div>

      {/* Review Notice */}

      <section
        className="
          mb-6
          rounded-2xl
          border
          border-amber-200
          bg-amber-50
          px-5
          py-4
          sm:rounded-3xl
        "
      >
        <div className="flex items-start gap-3">

          <span className="text-xl">
            ⏳
          </span>

          <div>
            <h1 className="font-bold text-amber-900">
              Story Awaiting Review
            </h1>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              This story has not been published yet.
              You are viewing the private review version
              as an administrator.
            </p>
          </div>

        </div>
      </section>

      {/* Story */}

      <article
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          sm:rounded-3xl
        "
      >

        {/* Cover */}

        {story.coverImage && (
          <div className="relative h-64 w-full overflow-hidden bg-slate-100 sm:h-96 lg:h-[500px]">

            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

          </div>
        )}

        <div className="p-5 sm:p-8 lg:p-10">

          {/* Category */}

          <span
            className="
              inline-flex
              rounded-full
              bg-blue-50
              px-3
              py-1.5
              text-xs
              font-bold
              text-blue-700
            "
          >
            {story.category.name}
          </span>

          {/* Title */}

          <h2
            className="
              mt-4
              text-3xl
              font-extrabold
              leading-tight
              tracking-tight
              text-slate-900
              sm:text-4xl
              lg:text-5xl
            "
          >
            {story.title}
          </h2>

          {/* Meta */}

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-2
              text-sm
              text-slate-500
            "
          >

            <span className="font-semibold text-slate-700">
              {story.author.displayName}
            </span>

            <span>•</span>

            <span>
              {new Date(
                story.createdAt
              ).toLocaleDateString("en-NG")}
            </span>

            <span>•</span>

            <span>
              {readTime} min read
            </span>

          </div>

          {/* Author information */}

          <div
            className="
              mt-6
              rounded-2xl
              bg-slate-50
              p-4
              sm:p-5
            "
          >

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Submitted by
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {story.author.displayName}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {story.author.email}
            </p>

          </div>

          {/* Story Content */}

          <div
            className="
              mx-auto
              mt-10
              max-w-3xl
              text-lg
              leading-9
              text-slate-700
            "
          >

            {story.content
              .split(/\n\s*\n/)
              .filter(
                (paragraph) =>
                  paragraph.trim() !== ""
              )
              .map((paragraph, index) => (
                <p
                  key={index}
                  className="
                    mb-8
                    whitespace-pre-wrap
                    text-justify
                  "
                >
                  {paragraph.trim()}
                </p>
              ))}

          </div>

          {/* Story Images */}

          {story.images.length > 0 && (
            <section
              className="
                mx-auto
                mt-12
                max-w-4xl
                space-y-10
              "
            >

              {story.images.map((image) => (
                <figure
                  key={image.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    bg-slate-50
                    shadow-sm
                    sm:rounded-3xl
                  "
                >

                  <div
                    className="
                      relative
                      h-64
                      w-full
                      sm:h-96
                      lg:h-[520px]
                    "
                  >

                    <Image
                      src={image.imageUrl}
                      alt={
                        image.caption ||
                        story.title
                      }
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />

                  </div>

                  {image.caption && (
                    <figcaption
                      className="
                        px-5
                        py-4
                        text-center
                        text-sm
                        italic
                        text-slate-500
                      "
                    >
                      {image.caption}
                    </figcaption>
                  )}

                </figure>
              ))}

            </section>
          )}

        </div>

      </article>
{/* Review Actions */}

<section
  className="
    mt-6
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    shadow-sm
    sm:rounded-3xl
    sm:p-6
  "
>
  <h2 className="text-lg font-bold text-slate-900">
    Review Actions
  </h2>

  <p className="mt-1 text-sm leading-6 text-slate-500">
    Approve this story to publish it immediately, or
    reject it and send feedback to the author.
  </p>

  <ReviewActions
    storyId={story.id}
    storyTitle={story.title}
  />
</section>

    </main>
  );
                  }
