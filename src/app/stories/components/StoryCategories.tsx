'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StoryCategories() {
  const pathname = usePathname();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [showIndicator, setShowIndicator] = useState(true);
  const [animateArrow, setAnimateArrow] = useState(true);

  const categories = [
    { name: 'Single Dads', link: '/stories/single-dads' },
    { name: 'Single Moms', link: '/stories/single-moms' },
    { name: 'Pregnancy', link: '/stories/pregnancy' },
    { name: 'Newborn', link: '/stories/newborn' },
    { name: 'Toddlers', link: '/stories/toddlers' },
    { name: 'Teenagers', link: '/stories/teenagers' },
    { name: 'Success Stories', link: '/stories/success-stories' },
  ];

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const atEnd =
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 10;

      setShowIndicator(!atEnd);

      if (container.scrollLeft > 5) {
        setAnimateArrow(false);
      }
    };

    handleScroll();

    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="mb-12">
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 pr-16 scrollbar-hide scroll-smooth"
        >
          {categories.map((category) => {
            const active = pathname === category.link;

            return (
              <Link
                key={category.name}
                href={category.link}
                className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  active
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        <div
          className={`pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-gray-50 to-transparent transition-opacity duration-300 ${
            showIndicator ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 text-xl font-bold text-slate-700 shadow-lg transition-all duration-300 ${
            showIndicator ? 'opacity-100' : 'opacity-0'
          } ${animateArrow && showIndicator ? 'animate-bounce' : ''}`}
        >
          ›
        </div>
      </div>
    </section>
  );
}
