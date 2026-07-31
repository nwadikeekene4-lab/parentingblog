"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  return (
    <div className="space-y-8">

      {/* Header */}

      <section>

        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Update your personal information and public profile.
        </p>

      </section>

      {/* Profile Card */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <div className="flex flex-col items-center gap-4">

          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-5xl">
            👤
          </div>

          <button
            className="rounded-lg border border-blue-600 px-5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Change Profile Picture
          </button>

        </div>

      </section>

      {/* Form */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <div className="space-y-6">

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Display Name
            </label>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Bio
            </label>

            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Country
              </label>

              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                State / Province
              </label>

              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State or Province"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

          <div className="flex justify-end">

            <button
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Save Changes
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}
