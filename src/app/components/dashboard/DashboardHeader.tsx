"use client";

import { useEffect, useState } from "react";

type DashboardHeaderProps = {
  onMenuClick: () => void;
};

type ProfileData = {
  displayName: string;
  profileImage: string | null;
};

type Notification = {
  id: string;
  type:
    | "comment"
    | "reply"
    | "like"
    | "bookmark"
    | "system";
  message: string;
  isRead: boolean;
  createdAt: string;
};

function getNotificationIcon(
  type: Notification["type"]
) {
  switch (type) {
    case "comment":
      return "💬";

    case "reply":
      return "↩️";

    case "like":
      return "❤️";

    case "bookmark":
      return "🔖";

    case "system":
      return "🔔";

    default:
      return "🔔";
  }
}

function getNotificationTitle(
  type: Notification["type"]
) {
  switch (type) {
    case "comment":
      return "New Comment";

    case "reply":
      return "New Reply";

    case "like":
      return "Story Liked";

    case "bookmark":
      return "Story Bookmarked";

    case "system":
      return "System Notification";

    default:
      return "Notification";
  }
}

function formatNotificationTime(
  dateString: string
) {
  const date =
    new Date(dateString);

  const now =
    new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return date.toLocaleDateString();
}

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [markingAsRead, setMarkingAsRead] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD HEADER DATA
  |--------------------------------------------------------------------------
  */

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

        setNotifications(
          notificationsData.notifications ?? []
        );

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


  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  async function loadNotifications() {

    try {

      setLoadingNotifications(true);

      const response =
        await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ??
            "Failed to load notifications."
        );

      }


      setNotifications(
        data.notifications ?? []
      );

      setUnreadCount(
        data.unreadCount ?? 0
      );

    } catch (error) {

      console.error(
        "Failed to load notifications:",
        error
      );

    } finally {

      setLoadingNotifications(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD + EVENTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadHeaderData();


    function handleProfileUpdated() {

      loadHeaderData();

    }


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


    return () => {

      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdated
      );


      window.removeEventListener(
        "notificationUpdated",
        handleNotificationUpdated
      );

    };

  }, []);


  /*
  |--------------------------------------------------------------------------
  | NOTIFICATION BELL
  |--------------------------------------------------------------------------
  */

  async function handleNotificationClick() {

    const nextState =
      !showNotifications;


    setShowNotifications(
      nextState
    );


    if (nextState) {

      await loadNotifications();

    }

  }


  /*
  |--------------------------------------------------------------------------
  | MARK ALL AS READ
  |--------------------------------------------------------------------------
  */

  async function markAllAsRead() {

    if (
      markingAsRead ||
      unreadCount === 0
    ) {
      return;
    }


    try {

      setMarkingAsRead(true);


      const response =
        await fetch(
          "/api/notifications",
          {
            method: "PATCH",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ??
            "Failed to mark notifications as read."
        );

      }


      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      );


      setUnreadCount(0);


      /*
      |--------------------------------------------------------------------------
      | Tell other parts of the dashboard
      |--------------------------------------------------------------------------
      */

      window.dispatchEvent(
        new Event(
          "notificationUpdated"
        )
      );


    } catch (error) {

      console.error(
        "Failed to mark notifications as read:",
        error
      );

    } finally {

      setMarkingAsRead(false);

    }

  }


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

        <div className="relative">

          <button
            type="button"
            onClick={
              handleNotificationClick
            }
            className="relative rounded-lg p-2 text-xl transition hover:bg-gray-100"
            aria-label="Notifications"
            aria-expanded={
              showNotifications
            }
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


          {/* Notification Dropdown */}

          {showNotifications && (

            <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

              {/* Dropdown Header */}

              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">

                <div>

                  <h2 className="font-semibold text-gray-900">
                    Notifications
                  </h2>


                  {unreadCount > 0 && (

                    <p className="mt-0.5 text-xs text-gray-500">
                      {unreadCount} unread
                    </p>

                  )}

                </div>


                {unreadCount > 0 && (

                  <button
                    type="button"
                    onClick={
                      markAllAsRead
                    }
                    disabled={
                      markingAsRead
                    }
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >

                    {markingAsRead
                      ? "Updating..."
                      : "Mark all as read"}

                  </button>

                )}

              </div>


              {/* Notifications List */}

              <div className="max-h-[400px] overflow-y-auto">

                {loadingNotifications ? (

                  <div className="px-5 py-8 text-center">

                    <p className="text-sm text-gray-500">
                      Loading notifications...
                    </p>

                  </div>

                ) : notifications.length === 0 ? (

                  <div className="px-5 py-10 text-center">

                    <div className="text-3xl">
                      🔔
                    </div>


                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No notifications
                    </p>


                    <p className="mt-1 text-xs text-gray-500">
                      You're all caught up.
                    </p>

                  </div>

                ) : (

                  notifications
                    .slice(0, 8)
                    .map(
                      (notification) => (

                        <div
                          key={
                            notification.id
                          }
                          className={`border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                            !notification.isRead
                              ? "bg-blue-50/60"
                              : "bg-white"
                          }`}
                        >

                          <div className="flex gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base shadow-sm">

                              {getNotificationIcon(
                                notification.type
                              )}

                            </div>


                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p className="text-sm font-semibold text-gray-900">

                                  {getNotificationTitle(
                                    notification.type
                                  )}

                                </p>


                                {!notification.isRead && (

                                  <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    New
                                  </span>

                                )}

                              </div>


                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">

                                {notification.message}

                              </p>


                              <p className="mt-1 text-[10px] text-gray-400">

                                {formatNotificationTime(
                                  notification.createdAt
                                )}

                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )

                )}

              </div>


              {/* Footer */}

              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">

                <a
                  href="/dashboard/notifications"
                  onClick={() =>
                    setShowNotifications(
                      false
                    )
                  }
                  className="block text-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  View all notifications
                </a>

              </div>

            </div>

          )}

        </div>


        {/* Profile */}

        <button
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          aria-label="Profile"
        >

          {profile?.profileImage ? (

            <img
              src={
                profile.profileImage
              }
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
