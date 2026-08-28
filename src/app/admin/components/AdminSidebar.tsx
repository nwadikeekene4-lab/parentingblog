"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItemProps = {
  href: string;
  icon: string;
  label: string;
};

function AdminNavItem({
  href,
  icon,
  label,
}: AdminNavItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    (href !== "/admin" &&
      pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`
        group
        flex
        min-h-11
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-sm
        font-medium
        transition-all
        duration-200
        ease-out
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-1
        ${
          active
            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        }
      `}
    >
      <span
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          text-base
          transition
          ${
            active
              ? "bg-white/15"
              : "bg-slate-100 group-hover:bg-blue-100"
          }
        `}
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>
    </Link>
  );
}

type AdminSectionProps = {
  title: string;
  children: React.ReactNode;
};

function AdminSection({
  title,
  children,
}: AdminSectionProps) {
  return (
    <div className="mt-7 first:mt-0">
      <p
        className="
          mb-2
          px-2
          text-[11px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-slate-400
        "
      >
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  return (
    <aside
      className="
        fixed
        inset-y-0
        left-0
        z-40
        hidden
        w-72
        flex-col
        border-r
        border-slate-200
        bg-white
        shadow-sm
        lg:flex
      "
      aria-label="Admin dashboard navigation"
    >
      {/* Brand */}
      <div
        className="
          flex
          h-20
          shrink-0
          items-center
          border-b
          border-slate-200
          px-6
        "
      >
        <Link
          href="/admin"
          className="
            flex
            min-w-0
            items-center
            gap-3
            rounded-xl
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-blue-600
              to-indigo-600
              text-lg
              shadow-md
              shadow-blue-600/20
            "
          >
            👨‍👩‍👧
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              Parenting Together
            </p>

            <p className="mt-0.5 truncate text-xs font-medium text-blue-600">
              Admin Dashboard
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-4
          py-6
        "
      >
        {/* Overview */}
        <AdminNavItem
          href="/admin"
          icon="🏠"
          label="Overview"
        />

        {/* Stories */}
        <AdminSection title="Stories">
          <AdminNavItem
            href="/admin/my-stories"
            icon="✍️"
            label="My Stories"
          />

          <AdminNavItem
            href="/admin/pending-review"
            icon="⏳"
            label="Pending Review"
          />

          <AdminNavItem
            href="/admin/published"
            icon="📚"
            label="Published"
          />
        </AdminSection>

        {/* Featured */}
        <AdminSection title="Featured">
          <AdminNavItem
            href="/admin/featured"
            icon="⭐"
            label="Featured Stories"
          />
        </AdminSection>

        {/* Users */}
        <AdminSection title="Users">
          <AdminNavItem
            href="/admin/users"
            icon="👤"
            label="Users"
          />
        </AdminSection>

        {/* Moderation */}
        <AdminSection title="Moderation">
          <AdminNavItem
            href="/admin/comments"
            icon="💬"
            label="Comments"
          />
        </AdminSection>

        {/* Analytics */}
        <AdminSection title="Analytics">
          <AdminNavItem
            href="/admin/visitors"
            icon="👁️"
            label="Visitors"
          />
        </AdminSection>

        {/* Account */}
        <AdminSection title="Account">
          <AdminNavItem
            href="/admin/change-password"
            icon="🔐"
            label="Change Password"
          />
        </AdminSection>
      </nav>

      {/* Logout */}
      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          p-4
        "
      >
        <Link
          href="/admin/logout"
          className="
            group
            flex
            min-h-11
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-600
            transition-all
            duration-200
            hover:bg-red-50
            hover:text-red-600
            focus:outline-none
            focus:ring-2
            focus:ring-red-500
            focus:ring-offset-1
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-base
              transition
              group-hover:bg-red-100
            "
            aria-hidden="true"
          >
            🚪
          </span>

          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
     }
