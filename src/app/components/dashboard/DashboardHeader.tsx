"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  link: string | null;

  storyId: string | null;

  commentId: string | null;

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
  const date = new Date(dateString);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
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

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
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
  const router = useRouter();

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
          notificationsData.notifications ??
            []
        );

        setUnreadCount(
          notificationsData.unreadCount ??
            0
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

      const response = await fetch(
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
  | CLICK NOTIFICATION
  |--------------------------------------------------------------------------
  */

  function handleNotificationItemClick(
    notification: Notification
  ) {
    setShowNotifications(false);

    if (notification.link) {
      router.push(
        notification.link
      );
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

      const response = await fetch(
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

  /*
  |--------------------------------------------------------------------------
  | PROFILE
  |--------------------------------------------------------------------------
  */

  function handleProfileClick() {
    router.push(
      "/users-dashboard/profile"
    );
  }

  const profileInitial =
    profile?.displayName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm sm:px-4 md:px-6">
      {/* LEFT SIDE */}

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95 lg:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>

        <h1 className="truncate text-base font-bold text-gray-900 sm:text-lg">
          Users Dashboard
        </h1>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* NOTIFICATIONS */}

        <div className="relative">
          <button
            type="button"
            onClick={
              handleNotificationClick
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:bg-gray-100 active:scale-95"
            aria-label="Notifications"
            aria-expanded={
              showNotifications
            }
          >
            🔔

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}

          {showNotifications && (
            <>
              {/* Mobile backdrop */}

              <button
                type="button"
                aria-label="Close notifications"
                onClick={() =>
                  setShowNotifications(
                    false
                  )
                }
                className="fixed inset-0 z-40 bg-black/10 sm:hidden"
              />

              <div className="fixed left-3 right-3 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[390px]">
                {/* HEADER */}

                <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-gray-900">
                      Notifications
                    </h2>

                    {unreadCount > 0 ? (
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        {unreadCount} unread
                        notification
                        {unreadCount === 1
                          ? ""
                          : "s"}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        You're all caught up
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
                      className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {markingAsRead
                        ? "Updating..."
                        : "Mark all read"}
                    </button>
                  )}
                </div>

                {/* LIST */}

                <div className="max-h-[min(62vh,420px)] overflow-y-auto overscroll-contain">
                  {loadingNotifications ? (
                    <div className="px-5 py-12 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg">
                        🔔
                      </div>

                      <p className="text-sm font-semibold text-gray-700">
                        Loading notifications...
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Please wait a moment.
                      </p>
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div className="px-5 py-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                        🔔
                      </div>

                      <p className="mt-4 text-sm font-bold text-gray-800">
                        No notifications
                      </p>

                      <p className="mx-auto mt-1 max-w-[240px] text-xs leading-5 text-gray-500">
                        New comments, replies,
                        likes and other updates
                        will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications
                      .slice(0, 8)
                      .map(
                        (
                          notification
                        ) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationItemClick(
                                notification
                              )
                            }
                            className={`group flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-gray-50 active:bg-gray-100 sm:px-5 ${
                              !notification.isRead
                                ? "bg-blue-50/70"
                                : "bg-white"
                            }`}
                          >
                            {/* ICON */}

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base shadow-sm ring-1 ${
                                !notification.isRead
                                  ? "bg-white ring-blue-100"
                                  : "bg-gray-50 ring-gray-200"
                              }`}
                            >
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <p className="min-w-0 flex-1 text-sm font-bold leading-5 text-gray-900">
                                  {getNotificationTitle(
                                    notification.type
                                  )}
                                </p>

                                {!notification.isRead && (
                                  <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                    New
                                  </span>
                                )}
                              </div>

                              <p className="mt-1.5 break-words text-xs leading-5 text-gray-600">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-1.5 text-[10px] font-medium text-gray-400">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </p>
                            </div>
                          </button>
                        )
                      )
                  )}
                </div>

                {/* FOOTER */}

                <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(
                        false
                      );

                      router.push(
                        "/users-dashboard/notifications"
                      );
                    }}
                    className="flex min-h-10 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-blue-600 ring-1 ring-gray-200 transition hover:bg-blue-50 hover:text-blue-700 active:scale-[0.99]"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PROFILE */}

        <button
          type="button"
          onClick={
            handleProfileClick
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm ring-2 ring-white transition hover:bg-blue-700 active:scale-95"
          aria-label="Open profile"
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
