"use client";

import Link from "next/link";

type DashboardNavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function DashboardNavItem({
  href,
  icon,
  label,
  active = false,
  onClick,
}: DashboardNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
      }
