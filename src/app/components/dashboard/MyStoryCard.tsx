import Link from "next/link";

type MyStoryCardProps = {
  id: string;
  title: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  featured?: boolean;
};

export default function MyStoryCard({
  id,
  title,
  category,
  image,
  views,
  likes,
  comments,
  bookmarks,
  featured = false,
}: MyStoryCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="relative">

        <img
          src={image}
          alt={title}
          className="h-52 w-full object-cover"
        />

        {featured && (
          <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
            Featured
          </span>
        )}

      </div>

      <div className="space-y-5 p-5">

        <div>

          <p className="text-sm font-medium text-blue-600">
            {category}
          </p>

          <h2 className="mt-2 line-clamp-2 text-xl font-semibold text-gray-900">
            {title}
          </h2>

        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">

          <span>👁 {views}</span>

          <span>❤️ {likes}</span>

          <span>💬 {comments}</span>

          <span>🔖 {bookmarks}</span>

        </div>

        <div className="flex flex-wrap gap-3">

          <Link
            href={`/stories/${id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View
          </Link>

          <Link
            href={`/users-dashboard/write-story?id=${id}`}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Edit
          </Link>

          <button
            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>

        </div>

      </div>

    </article>
  );
}
