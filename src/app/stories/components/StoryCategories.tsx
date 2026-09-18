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
    { name: 'One-Parent Dads', link: '/stories/one-parent-dads' },
    { name: 'One-Parent Moms', link: '/stories/one-parent-moms' },
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

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="mb-8 sm:mb-12">
      <div className="relative">
        <div
          ref={scrollRef}
          className="
            flex
            gap-2.5
            overflow-x-auto
            pb-2
            pr-10
            scroll-smooth
            scrollbar-hide
            overscroll-x-contain
            [-webkit-overflow-scrolling:touch]
          "
        >
          {categories.map((category) => {
            const active = pathname === category.link;

            return (
              <Link
                key={category.name}
                href={category.link}
                className={`
                  shrink-0
                  whitespace-nowrap
                  rounded-full
                  border
                  px-4
                  py-2.5
                  text-sm
                  font-semibold

                  transition-all
                  duration-150
                  ease-out

                  active:scale-[0.94]
                  active:brightness-95

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#d94f7b]
                  focus-visible:ring-offset-2

                  motion-reduce:transition-none
                  motion-reduce:active:transform-none

                  sm:px-5
                  sm:py-3

                  ${
                    active
                      ? `
                        border-[#c93668]
                        bg-[#c93668]
                        text-white
                        shadow-[0_6px_18px_rgba(201,54,104,0.22)]

                        active:bg-[#b92e5d]
                        active:shadow-[0_3px_10px_rgba(201,54,104,0.18)]
                      `
                      : `
                        border-[#f0dce4]
                        bg-white
                        text-[#624653]
                        shadow-[0_3px_12px_rgba(76,42,56,0.05)]

                        hover:border-[#e6bfd0]
                        hover:bg-[#fff8fb]
                        hover:text-[#b52e5d]

                        active:bg-[#fff0f5]
                        active:border-[#e1b7c8]
                      `
                  }
                `}
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        {/* Scroll fade */}
        <div
          className={`
            pointer-events-none
            absolute
            right-0
            top-0
            h-full
            w-14
            bg-gradient-to-l
            from-[#fff9f6]
            to-transparent
            transition-opacity
            duration-300

            ${
              showIndicator
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />

        {/* Small scroll cue */}
        <div
          className={`
            pointer-events-none
            absolute
            right-1
            top-1/2
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-[#f0dce4]
            bg-white
            text-lg
            font-bold
            text-[#b52e5d]
            shadow-[0_4px_12px_rgba(76,42,56,0.10)]
            transition-all
            duration-300

            ${
              showIndicator
                ? "opacity-100"
                : "opacity-0"
            }

            ${
              animateArrow && showIndicator
                ? "animate-pulse"
                : ""
            }
          `}
        >
          ›
        </div>
      </div>
    </section>
  );
     }
