"use client";

import { useState } from "react";

import AdminSidebar from "./components/AdminSidebar";
import AdminMobileSidebar from "./components/AdminMobileSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Sidebar */}
      <AdminMobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="lg:pl-72">

        {/* Header */}
        <AdminHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        {/* Page Content */}
        <main
          className="
            min-h-[calc(100vh-4rem)]
            px-4
            py-5
            sm:px-6
            sm:py-6
            lg:px-8
            lg:py-8
          "
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
      }
