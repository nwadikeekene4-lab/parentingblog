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
  | CHANGE PASSWORD
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
  | LIVE PASSWORD VALIDATION
  |--------------------------------------------------------------------------
  */

  const newPasswordTooShort =
    newPassword.length > 0 &&
    newPassword.length < 8;

  const newPasswordTooLong =
    newPassword.length > 128;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

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

        const response = await fetch(
          "/api/settings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load settings."
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailNotifications: checked,
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
        data.settings.emailNotifications
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
  | OPEN PASSWORD FORM
  |--------------------------------------------------------------------------
  */

  function openPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordError("");
    setPasswordSuccess("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordForm(true);
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE PASSWORD FORM
  |--------------------------------------------------------------------------
  */

  function closePasswordForm() {
    if (changingPassword) {
      return;
    }

    setShowPasswordForm(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordError("");
    setPasswordSuccess("");

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
    |--------------------------------------------------------------------------
    | Required fields
    |--------------------------------------------------------------------------
    */

    if (!currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );

      return;
    }

    if (!newPassword) {
      setPasswordError(
        "Please enter a new password."
      );

      return;
    }

    if (!confirmPassword) {
      setPasswordError(
        "Please retype your new password."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | New password length
    |--------------------------------------------------------------------------
    */

    if (newPassword.length < 8) {
      setPasswordError(
        "Your new password must be at least 8 characters long."
      );

      return;
    }

    if (newPassword.length > 128) {
      setPasswordError(
        "Your new password cannot exceed 128 characters."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Password confirmation
    |--------------------------------------------------------------------------
    */

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "The new passwords do not match."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Submit to secure server API
    |--------------------------------------------------------------------------
    */

    setChangingPassword(true);

    try {
      const response = await fetch(
        "/api/settings/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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

      /*
      |--------------------------------------------------------------------------
      | Incorrect old password
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setPasswordError("");

      setPasswordSuccess(
        "Password changed successfully."
      );

      /*
      |--------------------------------------------------------------------------
      | Clear password fields after success
      |--------------------------------------------------------------------------
      */

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordSuccess("");

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <div className="space-y-8">

        {/* HEADER */}

        <section>
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage your account preferences and privacy.
          </p>
        </section>


        {/* PREFERENCES */}

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

            <div className="flex items-center justify-between gap-6">

              <div className="min-w-0">
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
                Saving notification preference...
              </p>
            )}

          </div>

        </section>


        {/* SECURITY */}

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Security
          </h2>

          <div className="space-y-4">

            <button
              type="button"
              onClick={
                openPasswordForm
              }
              className="w-full rounded-xl border border-blue-600 px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50 sm:w-auto"
            >
              Change Password
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-red-500 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50 sm:ml-3 sm:w-auto"
            >
              Delete Account
            </button>

          </div>

        </section>

      </div>


      {/* ================================================================== */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ================================================================== */}

      {showPasswordForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePasswordForm();
            }
          }}
        >

          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your password securely.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closePasswordForm
                }
                disabled={
                  changingPassword
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* ERROR */}

            {passwordError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {passwordError}
              </div>
            )}


            {/* SUCCESS */}

            {passwordSuccess && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium leading-5 text-green-700">
                ✓ {passwordSuccess}
              </div>
            )}


            <form
              onSubmit={
                handleChangePassword
              }
              className="space-y-5"
            >

              {/* CURRENT PASSWORD */}

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
                    onChange={(event) => {
                      setCurrentPassword(
                        event.target.value
                      );

                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    autoComplete="current-password"
                    disabled={
                      changingPassword ||
                      !!passwordSuccess
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      changingPassword ||
                      !!passwordSuccess
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                  >
                    {showCurrentPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

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
                    onChange={(event) => {
                      setNewPassword(
                        event.target.value
                      );

                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    autoComplete="new-password"
                    disabled={
                      changingPassword ||
                      !!passwordSuccess
                    }
                    className={`w-full rounded-xl border px-4 py-3 pr-20 text-sm outline-none transition focus:ring-2 disabled:bg-gray-100 ${
                      newPasswordTooShort ||
                      newPasswordTooLong
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : newPassword.length >= 8
                        ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      changingPassword ||
                      !!passwordSuccess
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>
{/* LIVE PASSWORD LENGTH MESSAGE */}

                {newPasswordTooShort && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Password must be at least 8 characters.
                  </p>
                )}

                {newPasswordTooLong && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Password cannot exceed 128 characters.
                  </p>
                )}

                {newPassword.length >= 8 &&
                  newPassword.length <= 128 && (
                    <p className="mt-2 text-xs font-medium text-green-600">
                      ✓ Password length is valid.
                    </p>
                  )}

              </div>


              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Retype New Password
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
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );

                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    autoComplete="new-password"
                    disabled={
                      changingPassword ||
                      !!passwordSuccess
                    }
                    className={`w-full rounded-xl border px-4 py-3 pr-20 text-sm outline-none transition focus:ring-2 disabled:bg-gray-100 ${
                      passwordsDoNotMatch
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : passwordsMatch
                        ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                    placeholder="Retype new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      changingPassword ||
                      !!passwordSuccess
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>


                {/* LIVE MATCH MESSAGE */}

                {passwordsDoNotMatch && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Passwords do not match.
                  </p>
                )}

                {passwordsMatch && (
                  <p className="mt-2 text-xs font-medium text-green-600">
                    ✓ Passwords match.
                  </p>
                )}

              </div>


              {/* ACTION BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closePasswordForm
                  }
                  disabled={
                    changingPassword
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>


                <button
                  type="submit"
                  disabled={
                    changingPassword ||
                    !!passwordSuccess ||
                    !currentPassword ||
                    newPassword.length < 8 ||
                    newPassword.length > 128 ||
                    newPassword !==
                      confirmPassword
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
                        }

                
