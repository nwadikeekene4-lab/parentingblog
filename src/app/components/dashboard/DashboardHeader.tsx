"use client";

type DashboardHeaderProps = {
  onMenuClick: () => void;
};

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">

      {/* Left */}

      <div className="flex items-center gap-3">

        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-gray-900">
          Users Dashboard
        </h1>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        <button
          className="relative rounded-lg p-2 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          🔔

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          aria-label="Profile"
        >
          U
        </button>

      </div>

    </header>
  );
          }
