type StoryPreviewCardProps = {
  image: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  readTime: string;
};

export default function StoryPreviewCard({
  image,
  title,
  category,
  excerpt,
  author,
  readTime,
}: StoryPreviewCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <img
        src={image}
        alt={title}
        className="h-56 w-full object-cover"
      />

      <div className="p-6">
        <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
          {category}
        </span>

        <h3 className="mt-4 text-2xl font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-gray-600">
          {excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>{author}</span>
          <span>{readTime}</span>
        </div>

        <button className="mt-6 font-semibold text-pink-600 transition hover:translate-x-2">
          Read Story →
        </button>
      </div>
    </article>
  );
      }
