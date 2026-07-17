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
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* Story Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm">
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
            <span className="font-medium">{author}</span>

            <span>{readTime}</span>
          </div>

          <button className="mt-5 font-semibold text-slate-800 transition-all duration-300 group-hover:translate-x-2">
            Read Story →
          </button>

        </div>

      </div>

    </article>
  );
        }
