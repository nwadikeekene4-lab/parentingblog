"use client";

import Image from "next/image";
import Link from "next/link";

type StoryImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
};

type BookmarkStory = {
  id: string;
  title: string;
  slug: string;
  content: string;

  coverImage: string | null;

  featured: boolean;

  views: number;
  likes: number;
  comments: number;
  bookmarkCount: number;

  publishedAt: string | null;

  author: {
    displayName: string;
    profileImage: string | null;
  };

  category: {
    name: string;
  };

  images: StoryImage[];
};

type BookmarkCardProps = {
  bookmarkId: string;
  bookmarkedAt: string;
  story: BookmarkStory;
  onRemove: (storyId: string) => void;
};

export default function BookmarkCard({
  bookmarkedAt,
  story,
  onRemove,
}: BookmarkCardProps) {

  const image =
    story.coverImage ??
    story.images[0]?.imageUrl ??
    "/images/loginimage.png";

  const publishedDate =
    story.publishedAt
      ? new Date(
          story.publishedAt
        ).toLocaleDateString()
      : "";

  const savedDate =
    new Date(
      bookmarkedAt
    ).toLocaleDateString();

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Cover */}

      <div className="relative h-60">

        <Image
          src={image}
          alt={story.title}
          fill
          className="object-cover"
        />

        {story.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-gray-900 shadow">
            ⭐ Featured
          </span>
        )}

      </div>


      <div className="space-y-5 p-5">

        {/* Story information */}

        <div>

          <p className="text-sm font-semibold text-blue-600">
            {story.category.name}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {story.title}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Published {publishedDate}
            {" • "}
            Saved {savedDate}
          </p>

        </div>


        {/* Author */}

        <div className="flex items-center gap-3">

          {story.author.profileImage ? (

            <div className="relative h-10 w-10 overflow-hidden rounded-full">

              <Image
                src={story.author.profileImage}
                alt={story.author.displayName}
                fill
                className="object-cover"
              />

            </div>

          ) : (

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {story.author.displayName
                .charAt(0)
                .toUpperCase()}
            </div>

          )}

          <p className="text-sm font-semibold text-gray-900">
            {story.author.displayName}
          </p>

        </div>


        {/* Story */}

        <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {story.content}
        </div>


        {/* Additional images */}

        {story.images.length > 0 && (

          <div className="grid gap-4 sm:grid-cols-2">

            {story.images.map(
              (image) => (

                <figure
                  key={image.id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >

                  <div className="relative h-48">

                    <Image
                      src={image.imageUrl}
                      alt={
                        image.caption ??
                        story.title
                      }
                      fill
                      className="object-cover"
                    />

                  </div>

                  {image.caption && (
                    <figcaption className="p-3 text-xs text-gray-500">
                      {image.caption}
                    </figcaption>
                  )}

                </figure>

              )
            )}

          </div>

        )}


        {/* Statistics */}

        <div className="flex flex-wrap gap-5 border-y border-gray-100 py-4 text-sm text-gray-500">

          <span>👁 {story.views}</span>

          <span>❤️ {story.likes}</span>

          <span>💬 {story.comments}</span>

          <span>🔖 {story.bookmarkCount}</span>

        </div>


        {/* Actions */}

        <div className="flex flex-wrap gap-3">

          <Link
            href={`/stories/${story.slug}`}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Read Story
          </Link>

          <button
            type="button"
            onClick={() =>
              onRemove(story.id)
            }
            className="rounded-xl border border-red-500 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Remove Bookmark
          </button>

        </div>

      </div>

    </article>
  );
  }
