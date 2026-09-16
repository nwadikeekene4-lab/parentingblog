import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { stories } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

import StoryLikeButton from "@/app/components/storylikebutton";
import CommentsSection from "@/app/components/comments/CommentsSection";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl = "https://parentingblog-76yt.vercel.app";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const story = await db.query.stories.findFirst({
    where: eq(stories.slug, slug),
    with: {
      author: true,
      category: true,
    },
  });

  if (!story || story.isDeleted || story.status !== "published") {
    return {
      title: "Story Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    story.excerpt?.trim() ||
    story.content
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

  const canonicalUrl = `${siteUrl}/stories/${story.slug}`;

  return {
    title: story.title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: "Parenting Together",
      title: story.title,
      description,
      publishedTime: story.publishedAt
        ? new Date(story.publishedAt).toISOString()
        : undefined,
      authors: story.author?.displayName
        ? [story.author.displayName]
        : undefined,
      images: story.coverImage
        ? [
            {
              url: story.coverImage,
              alt: story.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: story.coverImage
        ? [story.coverImage]
        : undefined,
    },
  };
  }

export default async function StoryPage({
  params,
}: Props) {
  const { slug } = await params;

  const currentUser = await getCurrentUser();

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

  if (!story || story.isDeleted) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | Security
  |--------------------------------------------------------------------------
  | Published stories are public.
  | Unpublished stories can only be viewed by:
  | - The story author
  | - An admin
  |--------------------------------------------------------------------------
  */

  if (story.status !== "published") {
    if (!currentUser) {
      notFound();
    }

    const isAuthor =
      currentUser.id === story.authorId;

    const isAdmin =
      currentUser.role === "admin";

    if (!isAuthor && !isAdmin) {
      notFound();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Calculate reading time
  |--------------------------------------------------------------------------
  */

  const words =
    story.content.trim().split(/\s+/).length;

  const readTime = Math.max(
    1,
    Math.ceil(words / 200)
  );

  const storyStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: story.title,
  description:
    story.excerpt?.trim() ||
    story.content.replace(/\s+/g, " ").trim().slice(0, 160),
  url: `${siteUrl}/stories/${story.slug}`,
  datePublished: story.publishedAt
    ? new Date(story.publishedAt).toISOString()
    : undefined,
  dateModified: story.updatedAt
    ? new Date(story.updatedAt).toISOString()
    : undefined,
  author: {
    "@type": "Person",
    name: story.author.displayName,
  },
  publisher: {
    "@type": "Organization",
    name: "Parenting Together",
    url: siteUrl,
  },
  image: story.coverImage
    ? [story.coverImage]
    : undefined,
  articleSection: story.category.name,
};

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(storyStructuredData),
  }}
/>

      {/* Cover Image */}

      {story.coverImage && (
        <div className="relative mb-10 h-72 overflow-hidden rounded-3xl shadow-xl md:h-[520px]">
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            priority
            sizes="100vw"
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {/* Story Header */}

      <header className="mx-auto mb-12 max-w-3xl">

        <span className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
          {story.category.name}
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          {story.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">

          <span className="font-semibold">
            {story.author.displayName}
          </span>

          <span>•</span>

          <span>
            {story.publishedAt
              ? new Date(
                  story.publishedAt
                ).toLocaleDateString()
              : new Date(
                  story.createdAt
                ).toLocaleDateString()}
          </span>

          <span>•</span>

          <span>
            {readTime} min read
          </span>

        </div>
      </header>



      {/* Story Content */}

      <article className="mx-auto mt-12 max-w-3xl">

        <div className="text-lg leading-9 text-slate-700">

          {story.content
            .split(/\n\s*\n/)
            .filter(
              (paragraph) =>
                paragraph.trim() !== ""
            )
            .map(
              (paragraph, index) => (
                <p
                  key={index}
                  className="mb-8 whitespace-pre-wrap text-justify"
                >
                  {paragraph.trim()}
                </p>
              )
            )}

        </div>

      </article>

      {/* Story Images */}

      {story.images.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl space-y-12">

          {story.images.map((image) => (
            <figure
              key={image.id}
              className="overflow-hidden rounded-3xl bg-white shadow-lg"
            >

              <div className="relative h-72 w-full md:h-[520px]">

                <Image
                  src={image.imageUrl}
                  alt={
                    image.caption ||
                    story.title
                  }
                  fill
                  sizes="100vw"
                  unoptimized
                  className="object-cover"
                />

              </div>

              {image.caption && (
                <figcaption className="px-6 py-5 text-center text-sm italic text-slate-500">
                  {image.caption}
                </figcaption>
              )}

            </figure>
          ))}

        </section>
      )}

      {/* End of Story */}

      <section className="mx-auto mt-20 max-w-3xl border-t border-slate-200 pt-10 text-center">

        <h2 className="text-2xl font-bold text-slate-900">
          End of Story
        </h2>

        <p className="mt-4 text-slate-600">
          Thank you for reading this parenting
          story. We hope it inspired, encouraged
          or helped you in some way.
        </p>

      </section>

      {/* Story Like */}

      {story.status === "published" && (
        <section className="mx-auto mt-10 flex max-w-3xl justify-center">
          <StoryLikeButton storyId={story.id} />
        </section>
      )}

      {/* Comments - Only show for published stories */}

      {story.status === "published" && (
        <CommentsSection storyId={story.id} />
      )}

    </main>
  );
        }
