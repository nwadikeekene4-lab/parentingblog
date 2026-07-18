'use client';

import { useRouter } from 'next/navigation';

type Story = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  readTime: string;
};

type StoryCategoryLayoutProps = {
  title: string;
  description: string;
  image: string;
  stories?: Story[];
};

export default function StoryCategoryLayout({
  title,
  description,
  image,
  stories = [],
}: StoryCategoryLayoutProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section
        className="relative h-[300px] md:h-[360px] lg:h-[420px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6">

          <button
            onClick={() => router.push('/stories')}
            className="mb-8 w-fit rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
          >
            ← Back to Stories
          </button>

          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-200 md:text-lg">
            {description}
          </p>

        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Story Count */}
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            📚 {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
          </span>
        </div>

        {/* Search */}
        <div className="mb-10">
          <input
            type="text"
            placeholder={`🔍 Search stories in ${title}...`}
            className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-gray-700 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {stories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-20 text-center shadow-sm">

            <div className="text-6xl">📖</div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              No stories yet
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
              Be the first to inspire parents around the world by sharing your parenting journey and helping another family through your experience.
            </p>

            <button className="mt-8 rounded-2xl bg-slate-900 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-slate-800 active:scale-95">
              Share Your Story
            </button>

          </div>
        ) : (
          <div className="space-y-10">

            {stories.map((story) => (
              <article
                key={story.id}
                className="overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={story.image}
                  alt={story.title}
                  className="h-72 w-full object-cover"
                />

                <div className="p-8">

                  <div className="mb-3 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {title}
                  </div>

                  <h2 className="text-3xl font-bold text-slate-900">
                    {story.title}
                  </h2>

                  <p className="mt-5 leading-8 text-slate-600">
                    {story.excerpt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{story.author}</span>
                    <span>•</span>
                    <span>{story.publishedAt}</span>
                    <span>•</span>
                    <span>{story.readTime}</span>
                  </div>

                  <button
                    onClick={() => router.push(`/stories/${story.slug}`)}
                    className="mt-8 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 active:scale-95"
                  >
                    Read Story →
                  </button>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}
