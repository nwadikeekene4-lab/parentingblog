"use client";

import Link from "next/link";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        w-full
        items-center
        border-b
        border-slate-200
        bg-white/95
        px-4
        shadow-sm
        backdrop-blur-xl
        sm:h-[4.5rem]
        sm:px-6
        lg:px-8
      "
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-600
            shadow-sm
            transition-all
            duration-200
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            active:scale-95
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            lg:hidden
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Page identity */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            Admin Dashboard
          </p>

          <p className="hidden truncate text-xs text-slate-500 sm:block">
            Manage Parenting Together
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* View website */}
        <Link
          href="/"
          className="
            hidden
            min-h-10
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3
            text-sm
            font-medium
            text-slate-600
            transition-all
            duration-200
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            sm:flex
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12s-3.5 6.75-9.75 6.75S2.25 12 2.25 12Z"
            />
            <circle
              cx="12"
              cy="12"
              r="2.75"
            />
          </svg>

          <span>View Website</span>
        </Link>

        {/* Admin indicator */}
        <div
          className="
            flex
            h-10
            items-center
            gap-2
            rounded-xl
            bg-slate-100
            px-2.5
            sm:px-3
          "
        >
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-blue-600
              text-xs
              font-bold
              text-white
            "
            aria-hidden="true"
          >
            A
          </div>

          <span className="hidden text-sm font-semibold text-slate-700 md:block">
            Administrator
          </span>
        </div>
      </div>
    </header>
  );
          }
