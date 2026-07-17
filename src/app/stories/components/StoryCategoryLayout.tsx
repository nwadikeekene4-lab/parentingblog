'use client';

import { useRouter } from 'next/navigation';

type StoryCategoryLayoutProps = {
  title: string;
  description: string;
  image: string;
};

export default function StoryCategoryLayout({
  title,
  description,
  image,
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
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6">

          {/* Back Button */}
          <button
            onClick={() => router.push('/stories')}
            className="mb-8 w-fit rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/25 active:scale-95"
          >
            ← Back to Stories
          </button>

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-200 md:text-lg">
            {description}
          </p>

        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Stories Info */}
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
            📚 0 Stories • Updated Today
          </span>
        </div>

        {/* Search */}
        <div className="mb-10">
          <input
            type="text"
            placeholder={`🔍 Search stories in ${title}...`}
            className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-gray-700 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
          />
        </div>

        {/* Empty State */}
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-20 text-center shadow-sm">

          <div className="text-6xl">
            📖
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            No stories yet
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-7">
            Be the first to inspire parents around the world by sharing your
            parenting journey and helping another family through your
            experience.
          </p>

          <button
            className="mt-8 rounded-2xl bg-pink-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-pink-700 active:scale-95"
          >
            Share Your Story
          </button>

        </div>

      </section>

    </main>
  );
}
