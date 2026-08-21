"use client";

import {
  useEffect,
  useState,
} from "react";

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
  | CHANGE PASSWORD STATE
  |--------------------------------------------------------------------------
  */

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

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
        console.error(
          "Load settings error:",
          error
        );

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

    const previousValue =
      emailNotifications;

    setEmailNotifications(checked);
    setSavingEmailNotifications(true);
    setError("");

    try {
      const response = await fetch(
        "/api/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            emailNotifications:
              checked,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update email notification settings."
        );
      }

      setEmailNotifications(
        data.settings
          .emailNotifications
      );
    } catch (error) {
      console.error(
        "Update email notification setting error:",
        error
      );

      setEmailNotifications(
        previousValue
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update email notification settings."
      );
    } finally {
      setSavingEmailNotifications(
        false
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN CHANGE PASSWORD FORM
  |--------------------------------------------------------------------------
  */

  function openPasswordForm() {
    setShowPasswordForm(true);

    setPasswordError("");
    setPasswordSuccess("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE CHANGE PASSWORD FORM
  |--------------------------------------------------------------------------
  */

  function closePasswordForm() {
    if (changingPassword) {
      return;
    }

    setShowPasswordForm(false);

    setPasswordError("");
    setPasswordSuccess("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE PASSWORD
  |--------------------------------------------------------------------------
  */

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (changingPassword) {
      return;
    }

    setPasswordError("");
    setPasswordSuccess("");

    /*
    | Client-side validation
    */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long."
      );

      return;
    }

    if (newPassword.length > 128) {
      setPasswordError(
        "New password cannot exceed 128 characters."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation password do not match."
      );

      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        "/api/settings/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordSuccess(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      /*
      | Give the user time to see the
      | success message before closing.
      */

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
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
          Manage your account preferences
          and privacy.
        </p>
      </section>

      {/* Preferences */}

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

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

            <div className="min-w-0">
              <h3 className="font-medium text-gray-900">
                Email Notifications
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Receive email updates about
                your stories and activity.
              </p>
            </div>

            <label className="relative inline-flex shrink-0 cursor-pointer items-center">

              <input
                type="checkbox"
                checked={
                  emailNotifications
                }
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
              Saving notification
              preference...
            </p>
          )}

        </div>
      </section>

      {/* Security */}

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Security
        </h2>

        <div className="space-y-6">

          {/* Change Password */}

          {!showPasswordForm && (
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="font-medium text-gray-900">
                  Change Password
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Update your account password
                  to keep your account secure.
                </p>
              </div>

              <button
                type="button"
                onClick={openPasswordForm}
                className="w-full rounded-xl border border-blue-600 px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50 sm:w-auto"
              >
                Change Password
              </button>

            </div>
          )}

          {/* Password Form */}

          {showPasswordForm && (
            <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your current password
                  and choose a new password.
                </p>
              </div>

              {passwordError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {passwordSuccess}
                </div>
              )}

              <form
                onSubmit={
                  handleChangePassword
                }
                className="space-y-5"
              >

                {/* Current Password */}

                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      id="current-password"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        currentPassword
                      }
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      disabled={
                        changingPassword
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                      placeholder="Enter current password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={
                        changingPassword
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      {showCurrentPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                {/* New Password */}

                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        newPassword
                      }
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      disabled={
                        changingPassword
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={
                        changingPassword
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      {showNewPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Password must be between
                    8 and 128 characters.
                  </p>
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      disabled={
                        changingPassword
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={
                        changingPassword
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                {/* Buttons */}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closePasswordForm
                    }
                    disabled={
                      changingPassword
                    }
                    className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      changingPassword
                    }
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword
                      ? "Changing Password..."
                      : "Update Password"}
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* Delete Account */}

          <div className="flex flex-col gap-4 rounded-xl border border-red-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-medium text-gray-900">
                Delete Account
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Permanently delete your account
                and associated data.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="w-full c
