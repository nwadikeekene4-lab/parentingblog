'use client';

import { useRouter } from 'next/navigation';

type CategoryHeaderProps = {
  title: string;
  description: string;
};

export default function CategoryHeader({
  title,
  description,
}: CategoryHeaderProps) {
  const router = useRouter();

  return (
    <section className="mb-10">

      {/* Back Button */}
      <button
        onClick={() => router.push('/stories')}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-pink-500 hover:text-pink-600 active:scale-95"
      >
        ← Back to All Stories
      </button>

      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-gray-900">
        {title}
      </h1>

      {/* Description */}
      <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
        {description}
      </p>

    </section>
  );
        }
