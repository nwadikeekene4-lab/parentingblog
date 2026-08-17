"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardHeaderProps = {
  onMenuClick: () => void;
};

type ProfileData = {
  displayName: string;
  profileImage: string | null;
};

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadHeaderData() {
      try {
        const [
          profileResponse,
          notificationsResponse,
        ] = await Promise.all([
          fetch("/api/profile", {
            cache: "no-store",
          }),

          fetch("/api/notifications", {
            cache: "no-store",
          }),
        ]);

        if (
          profileResponse.ok &&
          !cancelled
        ) {
          const profileData =
            await profileResponse.json();

          setProfile(
            profileData.profile ?? null
          );
        }

        if (
          notificationsResponse.ok &&
          !cancelled
        ) {
          const notificationsData =
            await notificationsResponse.json();

          setUnreadCount(
            notificationsData.unreadCount ?? 0
          );
        }
      } catch (error) {
        console.error(
          "Failed to load dashboard header data:",
          error
        );
      }
    }

    loadHeaderData();

    /*
    |--------------------------------------------------------------------------
    | Profile updates
    |--------------------------------------------------------------------------
    */

    function handleProfileUpdated() {
      loadHeaderData();
    }

    /*
    |--------------------------------------------------------------------------
    | Notification updates
    |--------------------------------------------------------------------------
    */

    function handleNotificationUpdated() {
      loadHeaderData();
    }

    window.addEventListener(
      "profileUpdated",
      handleProfileUpdated
    );

    window.addEventListener(
      "notificationUpdated",
      handleNotificationUpdated
    );

    /*
    |--------------------------------------------------------------------------
    | Keep notification badge fresh
    |--------------------------------------------------------------------------
    */

    const interval = window.setInterval(
      loadHeaderData,
      30000
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdated
      );

      window.removeEventListener(
        "notificationUpdated",
        handleNotificationUpdated
      );

      window.clearInterval(interval);
    };
  }, []);

  const profileInitial =
    profile?.displayName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="
            rounded-lg p-2
            text-gray-700
            transition-all duration-150
            hover:bg-gray-100
            active:scale-90
            active:bg-gray-200
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
            lg:hidden
          "
          aria-label="Open menu"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-gray-900">
          Users Dashboard
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* NOTIFICATIONS */}

        <Link
          href="/users-dashboard/notifications"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
          className="
            relative flex h-10 w-10
            items-center justify-center
            rounded-xl
            text-xl
            text-gray-700
            transition-all duration-150
            hover:bg-gray-100
            hover:text-blue-600
            active:scale-90
            active:bg-gray-200
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
          "
        >
          <span aria-hidden="true">
            🔔
          </span>

          {unreadCount > 0 && (
            <span
              className="
                absolute -right-1 -top-1
                flex min-h-5 min-w-5
                items-center justify-center
                rounded-full
                bg-red-500
                px-1
                text-[10px]
                font-bold
                text-white
                shadow-sm
                ring-2
                ring-white
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </Link>

        {/* PROFILE */}

        <Link
          href="/users-dashboard/profile"
          aria-label="Open my profile"
          className="
            group
            flex h-10 w-10
            items-center justify-center
            overflow-hidden
            rounded-full
            bg-blue-600
            text-sm font-semibold
            text-white
            shadow-sm
            ring-2 ring-transparent
            transition-all duration-150
            hover:scale-105
            hover:bg-blue-700
            hover:ring-blue-200
            active:scale-90
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
          "
        >
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt={
                profile.displayName ||
                "Profile"
              }
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            profileInitial
          )}
        </Link>
      </div>
    </header>
  );
      }
