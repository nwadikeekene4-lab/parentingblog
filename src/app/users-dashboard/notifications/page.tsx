"use client";

import { useEffect, useState } from "react";


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


export default function NotificationsPage() {

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");


  async function loadNotifications() {

    try {

      setError("");

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
          data.message ||
          "Failed to load notifications."
        );
      }


      setNotifications(
        data.notifications ?? []
      );

    } catch (error) {

      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load notifications."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadNotifications();

  }, []);


  async function markAllAsRead() {

    if (processing) {
      return;
    }


    setProcessing(true);

    try {

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
          data.message ||
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


      window.dispatchEvent(
        new Event(
          "notificationUpdated"
        )
      );

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setProcessing(false);

    }

  }


  async function clearNotifications() {

    if (processing) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to clear all notifications?"
      );


    if (!confirmed) {
      return;
    }


    setProcessing(true);

    try {

      const response =
        await fetch(
          "/api/notifications",
          {
            method: "DELETE",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to clear notifications."
        );
      }


      setNotifications([]);


      window.dispatchEvent(
        new Event(
          "notificationUpdated"
        )
      );

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setProcessing(false);

    }

  }


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;


  return (
    <div className="space-y-8">

      {/* Header */}

      <section>

        <h1 className="text-3xl font-bold text-gray-900">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Stay updated with everything happening on your account.
        </p>

      </section>


      {/* Error */}

      {error && (

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </section>

      )}


      {/* Loading */}

      {loading && (

        <section className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <p className="text-sm text-gray-600">
            Loading notifications...
          </p>

        </section>

      )}


      {/* Notifications */}

      {!loading &&
        !error &&
        notifications.length > 0 && (

        <section className="space-y-4">

          {notifications.map(
            (notification) => (

              <article
                key={notification.id}
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  !notification.isRead
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">

                    {getNotificationIcon(
                      notification.type
                    )}

                  </div>


                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-4">

                      <h2 className="text-lg font-semibold text-gray-900">

                        {getNotificationTitle(
                          notification.type
                        )}

                      </h2>


                      {!notification.isRead && (

                        <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                          New
                        </span>

                      )}

                    </div>


                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>


                    <p className="mt-4 text-xs text-gray-500">
                      {formatNotificationTime(
                        notification.createdAt
                      )}
                    </p>

                  </div>

                </div>

              </article>

            )
          )}

        </section>

      )}


      {/* Empty State */}

      {!loading &&
        !error &&
        notifications.length === 0 && (

        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            🔔
          </div>

          <h2 className="mt-5 text-xl font-semibold text-gray-900">
            No notifications
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            When people interact with your stories or something important happens on your account, your notifications will appear here.
          </p>

        </section>

      )}


      {/* Actions */}

      {!loading &&
        notifications.length > 0 && (

        <section className="flex flex-wrap gap-4">

          {unreadCount > 0 && (

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={processing}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing
                ? "Processing..."
                : "Mark All as Read"}
            </button>

          )}


          <button
            type="button"
            onClick={clearNotifications}
            disabled={processing}
            className="rounded-xl border border-red-500 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear Notifications
          </button>

        </section>

      )}

    </div>
  );
  }
