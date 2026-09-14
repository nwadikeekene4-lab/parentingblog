import Image from "next/image";
import Link from "next/link";

import BookmarkButton from "../../components/story/BookmarkButton";

type StoryPreviewCardProps = {
  storyId: string;
  slug: string;
  image: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  readTime: string;
};

export default function StoryPreviewCard({
  storyId,
  slug,
  image,
  title,
  category,
  excerpt,
  author,
  readTime,
}: StoryPreviewCardProps) {
  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-[#f0dce4]
        bg-white
        shadow-[0_6px_22px_rgba(76,42,56,0.06)]
        transition-all
        duration-300

        sm:rounded-3xl

        md:hover:-translate-y-1.5
        md:hover:shadow-[0_16px_38px_rgba(76,42,56,0.11)]
      "
    >
      {/* Story Image */}
      <div
        className="
          relative
          aspect-[16/10]
          w-full
          overflow-hidden
          bg-[#f8edf2]

          sm:aspect-[16/10]
        "
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 768px) 100vw,
            (max-width: 1200px) 50vw,
            33vw
          "
          className="
            object-cover
            transition-transform
            duration-500
            md:group-hover:scale-[1.04]
          "
        />

        {/* Image shade */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-20
            bg-gradient-to-t
            from-black/25
            to-transparent
          "
        />

        {/* Category Badge */}
        <span
          className="
            absolute
            left-3
            top-3
            z-10
            rounded-full
            border
            border-white/50
            bg-white/90
            px-3
            py-1.5
            text-[11px]
            font-bold
            text-[#624653]
            shadow-sm
            backdrop-blur-md

            sm:left-4
            sm:top-4
            sm:px-4
            sm:py-1.5
            sm:text-xs
          "
        >
          {category}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <h3
          className="
            line-clamp-2
            text-lg
            font-bold
            leading-snug
            text-[#35232d]
            transition-colors
            duration-200

            sm:text-xl

            md:group-hover:text-[#b52e5d]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2
            line-clamp-3
            flex-1
            text-sm
            leading-6
            text-[#735f68]

            sm:mt-4
            sm:text-base
            sm:leading-7
          "
        >
          {excerpt}
        </p>

        {/* Footer */}
        <div
          className="
            mt-5
            border-t
            border-[#f1e2e8]
            pt-4

            sm:mt-7
            sm:pt-5
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              text-xs
              text-[#927b86]

              sm:text-sm
            "
          >
            <span className="min-w-0 truncate font-semibold text-[#624653]">
              {author}
            </span>

            <span className="shrink-0">
              {readTime}
            </span>
          </div>

          {/* Actions */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <BookmarkButton
              storyId={storyId}
              storySlug={slug}
            />

            <Link
              href={`/stories/${slug}`}
              className="
                rounded-full
                px-3
                py-2
                text-sm
                font-bold
                text-[#b52e5d]
                transition-all
                duration-200
                hover:bg-[#fff0f5]
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#d94f7b]
                focus-visible:ring-offset-2

                md:group-hover:translate-x-0.5
              "
            >
              Read Story →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
  }
  
