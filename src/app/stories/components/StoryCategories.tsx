'use client';

import { useRouter } from 'next/navigation';

export default function StoryCategories() {
  const router = useRouter();

  const categories = [
    { name: 'All', link: '/stories' },
    { name: 'Single Dads', link: '/stories/single-dads' },
    { name: 'Single Moms', link: '/stories/single-moms' },
    { name: 'Pregnancy', link: '/stories/pregnancy' },
    { name: 'Newborn', link: '/stories/newborn' },
    { name: 'Toddlers', link: '/stories/toddlers' },
    { name: 'School Age', link: '/stories/school-age' },
    { name: 'Teenagers', link: '/stories/teenagers' },
    { name: 'Parenting Tips', link: '/stories/parenting-tips' },
    { name: 'Success Stories', link: '/stories/success-stories' },
    { name: 'My Stories', link: '/stories/my-stories' },
  ];

  return (
    <section className="mb-12">
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {categories.map((category, index) => (
          <button
            key={category.name}
            onClick={() => router.push(category.link)}
            className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 ${
              index === 0
                ? 'bg-pink-600 text-white shadow-lg'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-pink-50 hover:border-pink-500'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
    }
