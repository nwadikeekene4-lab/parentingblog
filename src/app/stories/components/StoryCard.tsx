'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

type StoryCardProps = {
  title: string;
  description: string;
  image: string;
  link: string;
};

export default function StoryCard({
  title,
  description,
  image,
  link,
}: StoryCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(link)}
      className="group relative h-80 w-full overflow-hidden rounded-3xl text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.97]"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/15" />

      {/* Glass Panel */}
      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-md transition-all duration-300 group-hover:bg-white/20">
        <h3 className="text-2xl font-bold text-white">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-100">
          {description}
        </p>

        <div className="mt-4 inline-flex items-center font-semibold text-pink-300 transition-transform duration-300 group-hover:translate-x-2">
          Explore Stories →
        </div>
      </div>
    </button>
  );
      }
