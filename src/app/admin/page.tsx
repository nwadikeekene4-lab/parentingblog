"use client";

import Link from "next/link";

const stats = [
  {
    title: "Pending Review",
    value: "0",
    description: "Awaiting approval",
    icon: "⏳",
    href: "/admin/pending-review",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  {
    title: "Published",
    value: "0",
    description: "Published stories",
    icon: "📚",
    href: "/admin/published",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  {
    title: "My Stories",
    value: "0",
    description: "Your stories",
    icon: "✍️",
    href: "/admin/my-stories",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
  },
  {
    title: "Featured",
    value: "0",
    description: "Featured stories",
    icon: "⭐",
    href: "/admin/featured",
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-600",
  },
  {
    title: "Users",
    value: "0",
    description: "Registered users",
    icon: "👤",
    href: "/admin/users",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  {
    title: "Visitors",
    value: "0",
    description: "Stories visitors",
    icon: "👁️",
    href: "/admin/visitors",
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-600",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="w-full space-y-5 sm:space-y-6">

      {/* Welcome */}
      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          via-blue-700
          to-indigo-800
          px-5
          py-6
          text-white
          shadow-lg
          sm:rounded-3xl
          sm:px-7
          sm:py-7
          lg:px-8
        "
      >
        {/* Decorative circles */}
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-20
            h-48
            w-48
            rounded-full
            bg-white/10
            blur-2xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            right-24
            h-40
            w-40
            rounded-full
            bg-indigo-300/20
            blur-3xl
          "
        />

        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-100 sm:text-sm">
            Administration
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
            "
          >
            Admin Dashboard
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-blue-100
            "
          >
            Manage your stories, featured content, users
            and website activity from one place.
          </p>
        </div>
      </section>


      {/* Overview */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Overview
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Quick statistics
            </p>
          </div>

          {/* Mobile scroll hint */}
          <span className="text-xs text-slate-400 sm:hidden">
            Swipe →
          </span>
        </div>


        {/* Horizontal statistics rail */}
        <div
          className="
            -mx-4
            flex
            gap-3
            overflow-x-auto
            px-4
            pb-2
            scrollbar-none
            sm:-mx-6
            sm:px-6
            lg:-mx-8
            lg:px-8
          "
        >
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="
                group
                w-[220px]
                min-w-[220px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-md
                active:scale-[0.98]
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                sm:w-[230px]
                sm:min-w-[230px]
                sm:p-5
                lg:w-[240px]
                lg:min-w-[240px]
              "
            >
              <div className="flex items-center justify-between">
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    text-lg
                    ${stat.iconBg}
                    ${stat.iconText}
                  `}
                >
                  {stat.icon}
                </div>

                <span
                  className="
                    text-sm
                    text-slate-300
                    transition
                    group-hover:translate-x-1
                    group-hover:text-blue-500
                  "
                >
                  →
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-0.5 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* Quick Actions */}
      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          sm:rounded-3xl
          sm:p-5
          lg:p-6
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Frequently used tools
            </p>
          </div>
        </div>


        {/* Quick action rail on small screens */}
        <div
          className="
            -mx-1
            flex
            gap-2
            overflow-x-auto
            px-1
            pb-1
            sm:grid
            sm:grid-cols-2
            sm:overflow-visible
            lg:grid-cols-4
          "
        >

          <Link
            href="/admin/pending-review"
            className="
              flex
              min-w-[150px]
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
              sm:min-w-0
            "
          >
            Review Stories
          </Link>


          <Link
            href="/admin/my-stories"
            className="
              flex
              min-w-[150px]
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
              sm:min-w-0
            "
          >
            Write a Story
          </Link>


          <Link
            href="/admin/featured"
            className="
              flex
              min-w-[150px]
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
              sm:min-w-0
            "
          >
            Featured Stories
          </Link>


          <Link
            href="/admin/users"
            className="
              flex
              min-w-[150px]
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
              sm:min-w-0
            "
          >
            Manage Users
          </Link>

        </div>
      </section>


      {/* Admin tip */}
      <div
        className="
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-blue-100
          bg-blue-50/70
          px-4
          py-3
          text-sm
          text-blue-800
        "
      >
        <span className="mt-0.5 text-base">
          💡
        </span>

        <p className="leading-5">
          Use the sidebar to manage stories, featured
          content, users, comments and visitor activity.
        </p>
      </div>

    </div>
  );
    }
