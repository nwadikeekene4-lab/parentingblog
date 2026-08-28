"use client";

import Link from "next/link";

const stats = [
  {
    title: "Pending Review",
    value: "0",
    description: "Stories awaiting approval",
    icon: "⏳",
    href: "/admin/pending-review",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  {
    title: "Published Stories",
    value: "0",
    description: "Published non-featured stories",
    icon: "📚",
    href: "/admin/published",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  {
    title: "My Stories",
    value: "0",
    description: "Your published stories",
    icon: "✍️",
    href: "/admin/my-stories",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
  },
  {
    title: "Featured Stories",
    value: "0",
    description: "Stories currently featured",
    icon: "⭐",
    href: "/admin/featured",
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-600",
  },
  {
    title: "Registered Users",
    value: "0",
    description: "Registered accounts",
    icon: "👤",
    href: "/admin/users",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  {
    title: "Visitors",
    value: "0",
    description: "Stories page visitors",
    icon: "👁️",
    href: "/admin/visitors",
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-600",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="w-full space-y-6 sm:space-y-8">

      {/* Welcome section */}
      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          via-blue-700
          to-indigo-800
          p-6
          text-white
          shadow-lg
          sm:rounded-3xl
          sm:p-8
          lg:p-10
        "
      >
        {/* Decorative elements */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-56
            w-56
            rounded-full
            bg-white/10
            blur-2xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            right-20
            h-48
            w-48
            rounded-full
            bg-indigo-400/20
            blur-3xl
          "
        />

        <div className="relative max-w-3xl">
          <p className="text-sm font-medium text-blue-100">
            Welcome back
          </p>

          <h1
            className="
              mt-2
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
              lg:text-4xl
            "
          >
            Admin Dashboard
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-blue-100
              sm:text-base
              sm:leading-7
            "
          >
            Manage stories, featured content, users,
            moderation and website activity from one place.
          </p>
        </div>
      </section>


      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A quick look at your website activity.
          </p>
        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="
                group
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                sm:p-6
              "
            >
              <div className="flex items-start justify-between gap-4">

                {/* Icon */}
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    text-xl
                    ${stat.iconBg}
                    ${stat.iconText}
                  `}
                >
                  {stat.icon}
                </div>

                {/* Arrow */}
                <span
                  className="
                    text-lg
                    text-slate-300
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                    group-hover:text-blue-500
                  "
                  aria-hidden="true"
                >
                  →
                </span>
              </div>


              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-bold
                    tracking-tight
                    text-slate-900
                  "
                >
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                  {stat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* Quick actions */}
      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:rounded-3xl
          sm:p-6
          lg:p-8
        "
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Frequently used administration tools.
          </p>
        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <Link
            href="/admin/pending-review"
            className="
              flex
              min-h-12
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
            "
          >
            Review Stories
          </Link>


          <Link
            href="/admin/my-stories"
            className="
              flex
              min-h-12
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-600
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
            "
          >
            Write a Story
          </Link>


          <Link
            href="/admin/featured"
            className="
              flex
              min-h-12
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:border-yellow-200
              hover:bg-yellow-50
              hover:text-yellow-700
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-yellow-500
              focus:ring-offset-2
            "
          >
            Manage Featured
          </Link>


          <Link
            href="/admin/users"
            className="
              flex
              min-h-12
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
            "
          >
            Manage Users
          </Link>

        </div>
      </section>

    </div>
  );
      }
