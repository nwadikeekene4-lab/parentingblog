'use client';

import { useRouter } from 'next/navigation';

type StoryCardProps = {
  title: string;
  description: string;
  icon: string;
  link: string;
};

export default function StoryCard({
  title,
  description,
  icon,
  link,
}: StoryCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(link)}
      className="group w-full rounded-2xl bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-2 hover:shadow-xl active:scale-95"
    >
      <div className="mb-4 text-4xl">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-3 leading-6 text-gray-600">
        {description}
      </p>

      <div className="mt-5 text-sm font-semibold text-pink-500 transition-transform duration-200 group-hover:translate-x-2">
        Explore stories →
      </div>
    </button>
  );
                                  }
