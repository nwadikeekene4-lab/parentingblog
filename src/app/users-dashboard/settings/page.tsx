"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [loadingSettings, setLoadingSettings] =
    useState(true);

  const [savingEmailNotifications, setSavingEmailNotifications] =
    useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD SETTINGS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoadingSettings(true);
        setError("");

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load settings."
          );
        }

        if (!cancelled) {
          setEmailNotifications(
            data.settings.emailNotifications
          );
        }
      } catch (error) {
        console.error("Load settings error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load settings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSettings(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE EMAIL NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  async function handleEmailNotificationsChange(
    checked: boolean
  ) {
    if (savingEmailNotifications) {
      return;
    }

    const previousValue = emailNotifications;

    setEmailNotifications(checked);
    setSavingEmailNotifications(true);
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailNotifications: checked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update email notification settings."
        );
      }

      setEmailNotifications(
        data.settings.emailNotifications
      );
    } catch (error) {
      console.error(
        "Update email notification setting error:",
        error
      );

      setEmailNotifications(previousValue);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update email notification settings."
      );
    } finally {
      setSavingEmailNotifications(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <section>
        <h1 className="text-3xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Manage your account preferences and privacy.
        </p>
      </section>

      {/* Preferences */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Preferences
        </h2>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* Email Notifications */}

          <div className="flex items-center justify-between gap-6">

            <div>
              <h3 className="font-medium text-gray-900">
                Email Notifications
              </h3>

              <p className="text-sm text-gray-500">
                Receive email updates about your stories
                and activity.
              </p>
            </div>

            <label className="relative inline-flex shrink-0 cursor-pointer items-center">

              <input
                type="checkbox"
                checked={emailNotifications}
                disabled={
                  loadingSettings ||
                  savingEmailNotifications
                }
                onChange={(event) =>
                  handleEmailNotificationsChange(
                    event.target.checked
                  )
                }
                className="peer sr-only"
              />

              <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />

              <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />

            </label>

          </div>

          {savingEmailNotifications && (
            <p className="text-xs text-gray-500">
              Saving notification preference...
            </p>
          )}

        </div>
      </section>

      {/* Security */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Security
        </h2>

        <div className="space-y-4">

          <button
            type="button"
            className="rounded-xl border border-blue-600 px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Change Password
          </button>

          <button
            type="button"
            className="rounded-xl border border-red-500 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete Account
          </button>

        </div>
      </section>

    </div>
  );
      }
