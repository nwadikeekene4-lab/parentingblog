"use client";

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


        if (profileResponse.ok) {

          const profileData =
            await profileResponse.json();

          setProfile(
            profileData.profile
          );

        }


        if (notificationsResponse.ok) {

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
     * Allows the profile page to tell the
     * header that the profile was updated.
     */
    function handleProfileUpdated() {

      loadHeaderData();

    }


    window.addEventListener(
      "profileUpdated",
      handleProfileUpdated
    );


    return () => {

      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdated
      );

    };

  }, []);


  const profileInitial =
    profile?.displayName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";


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

        {/* Notifications */}

        <button
          className="relative rounded-lg p-2 transition hover:bg-gray-100"
          aria-label="Notifications"
        >

          🔔

          {unreadCount > 0 && (

            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">

              {unreadCount > 99
                ? "99+"
                : unreadCount}

            </span>

          )}

        </button>


        {/* Profile */}

        <button
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          aria-label="Profile"
        >

          {profile?.profileImage ? (

            <img
              src={profile.profileImage}
              alt={
                profile.displayName ||
                "Profile"
              }
              className="h-full w-full object-cover"
            />

          ) : (

            profileInitial

          )}

        </button>

      </div>

    </header>
  );
          }
