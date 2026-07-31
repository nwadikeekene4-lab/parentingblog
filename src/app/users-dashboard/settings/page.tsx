
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

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

      {/* Account Settings */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Preferences
        </h2>

        <div className="space-y-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-medium text-gray-900">
                Email Notifications
              </h3>

              <p className="text-sm text-gray-500">
                Receive updates about your stories and activity.
              </p>

            </div>

            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() =>
                setEmailNotifications(!emailNotifications)
              }
              className="h-5 w-5"
            />

          </div>

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-medium text-gray-900">
                Public Profile
              </h3>

              <p className="text-sm text-gray-500">
                Allow other users to view your profile.
              </p>

            </div>

            <input
              type="checkbox"
              checked={publicProfile}
              onChange={() =>
                setPublicProfile(!publicProfile)
              }
              className="h-5 w-5"
            />

          </div>

        </div>

      </section>

      {/* Security */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Security
        </h2>

        <div className="space-y-4">

          <button
            className="rounded-xl border border-blue-600 px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Change Password
          </button>

          <button
            className="rounded-xl border border-red-500 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete Account
          </button>

        </div>

      </section>

    </div>
  );
}
