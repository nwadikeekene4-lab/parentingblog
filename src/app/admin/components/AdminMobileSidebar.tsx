"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type AdminMobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
};

function NavItem({
  href,
  icon,
  label,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    (href !== "/admin" &&
      pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onClick}
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
        ${
          active
            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
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

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <div className="mt-7">
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

export default function AdminMobileSidebar({
  isOpen,
  onClose,
}: AdminMobileSidebarProps) {
  const router = useRouter();

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
   * Prevent the page behind the sidebar from
   * scrolling while the mobile menu is open.
   */
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  /*
   * Close the sidebar when the user presses Escape.
   */
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout request failed"
        );
      }

      onClose();

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );

      setLoggingOut(false);

      alert(
        "Unable to log out right now. Please try again."
      );
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="
          fixed
          inset-0
          z-[60]
          bg-slate-950/50
          backdrop-blur-[2px]
          lg:hidden
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-[70]
          flex
          h-dvh
          w-[min(20rem,88vw)]
          flex-col
          overflow-hidden
          border-r
          border-slate-200
          bg-white
          shadow-2xl
          lg:hidden
        "
        aria-label="Admin dashboard navigation"
      >
        {/* Header */}
        <div
          className="
            flex
            min-h-20
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-200
            px-5
          "
        >
          <Link
            href="/admin"
            onClick={onClose}
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

          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="
              ml-3
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            ✕
          </button>
        </div>

        {/* Scrollable navigation */}
        <nav
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-4
            py-5
          "
        >
          {/* Overview */}
          <NavItem
            href="/admin"
            icon="🏠"
            label="Overview"
            onClick={onClose}
          />

          {/* Stories */}
          <Section title="Stories">
            <NavItem
              href="/admin/my-stories"
              icon="✍️"
              label="My Stories"
              onClick={onClose}
            />

            <NavItem
              href="/admin/pending-review"
              icon="⏳"
              label="Pending Review"
              onClick={onClose}
            />

            <NavItem
              href="/admin/published"
              icon="📚"
              label="Published"
              onClick={onClose}
            />
          </Section>

          {/* Featured */}
          <Section title="Featured">
            <NavItem
              href="/admin/featured"
              icon="⭐"
              label="Featured Stories"
              onClick={onClose}
            />
          </Section>

          {/* Users */}
          <Section title="Users">
            <NavItem
              href="/admin/users"
              icon="👤"
              label="Users"
              onClick={onClose}
            />
          </Section>

          {/* Moderation */}
          <Section title="Moderation">
            <NavItem
              href="/admin/comments"
              icon="💬"
              label="Comments"
              onClick={onClose}
            />
          </Section>

          {/* Analytics */}
          <Section title="Analytics">
            <NavItem
              href="/admin/visitors"
              icon="👁️"
              label="Visitors"
              onClick={onClose}
            />
          </Section>

          {/* Account */}
          <Section title="Account">
            <NavItem
              href="/admin/change-password"
              icon="🔐"
              label="Change Password"
              onClick={onClose}
            />
          </Section>
        </nav>

        {/* Permanently visible logout */}
        <div
          className="
            shrink-0
            border-t
            border-slate-200
            bg-white
            p-4
            pb-[max(1rem,env(safe-area-inset-bottom))]
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
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
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-red-500
              disabled:cursor-not-allowed
              disabled:opacity-60
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
              "
              aria-hidden="true"
            >
              {loggingOut
                ? "⏳"
                : "🚪"}
            </span>

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
          }
