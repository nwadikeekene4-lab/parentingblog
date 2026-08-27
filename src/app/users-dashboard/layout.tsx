"use client";

import { useState } from "react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardMobileSidebar from "../components/dashboard/DashboardMobileSidebar";

export default function UsersDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-cover
        bg-center
        bg-fixed
      "
      style={{
        backgroundImage:
          "url('/Images/loginimage.png')",
      }}
    >
      {/* Background overlay */}
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          bg-white/60
          backdrop-blur-sm
        "
        aria-hidden="true"
      />

      {/* Dashboard layer */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <DashboardSidebar />

        {/* Mobile Sidebar */}
        <DashboardMobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main dashboard area */}
        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
            lg:ml-72
          "
        >
          {/* Header */}
          <DashboardHeader
            onMenuClick={() => setMobileSidebarOpen(true)}
          />

          {/* Page content */}
          <main
            className="
              min-w-0
              flex-1
              px-3
              py-4
              sm:px-4
              sm:py-5
              md:px-6
              md:py-6
              lg:px-8
              lg:py-8
              xl:px-10
              2xl:px-12
            "
          >
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
