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
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* Story Image */}

      <div className="relative h-56 w-full overflow-hidden">

        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}

        <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm">
          {category}
        </span>

      </div>


      {/* Card Content */}

      <div className="flex flex-1 flex-col p-6">

        <h3 className="text-xl font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
          {title}
        </h3>


        <p className="mt-4 flex-1 text-base leading-7 text-slate-600">
          {excerpt}
        </p>


        {/* Footer */}

        <div className="mt-8 border-t border-stone-200 pt-5">

          <div className="flex items-center justify-between text-sm text-slate-500">

            <span className="font-medium">
              {author}
            </span>

            <span>
              {readTime}
            </span>

          </div>


          {/* Actions */}

          <div className="mt-5 flex flex-wrap items-center gap-3">

            {/* Bookmark */}

            <BookmarkButton
              storyId={storyId}
            />


            {/* Read Story */}

            <Link
              href={`/stories/${slug}`}
              className="font-semibold text-slate-800 transition-all duration-300 hover:text-blue-600 group-hover:translate-x-1"
            >
              Read Story →
            </Link>

          </div>

        </div>

      </div>

    </article>
  );
}
