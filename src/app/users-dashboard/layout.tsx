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
        min-h-screen
        bg-cover
        bg-center
        bg-fixed
        relative
      "
      style={{
        backgroundImage:
          "url('/images/loginimage.png')",
      }}
    >

      {/* Background overlay */}
      <div
        className="
          absolute
          inset-0
          bg-white/60
          backdrop-blur-sm
        "
      />


      <div className="relative z-10 min-h-screen">

        <DashboardSidebar />

        <DashboardMobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="lg:ml-72">

          <DashboardHeader
            onMenuClick={() => setMobileSidebarOpen(true)}
          />

          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
      }
