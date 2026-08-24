"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

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
  | DELETE ACCOUNT
  |--------------------------------------------------------------------------
  */

  const [showDeleteAccountForm, setShowDeleteAccountForm] =
    useState(false);

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [showDeletePassword, setShowDeletePassword] =
    useState(false);

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  const [deleteAccountError, setDeleteAccountError] =
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

  const hasUppercase =
    /[A-Z]/.test(newPassword);

  const hasLowercase =
    /[a-z]/.test(newPassword);

  const hasNumber =
    /[0-9]/.test(newPassword);

  const hasSpecialCharacter =
    /[^A-Za-z0-9]/.test(newPassword);

  const passwordLengthValid =
    newPassword.length >= 8 &&
    newPassword.length <= 128;

  const passwordStrengthValid =
    passwordLengthValid &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  /*
  |--------------------------------------------------------------------------
  | PASSWORD STRENGTH
  |--------------------------------------------------------------------------
  */

  const passwordStrengthScore = [
    passwordLengthValid,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialCharacter,
  ].filter(Boolean).length;

  const passwordStrengthLabel =
    newPassword.length === 0
      ? ""
      : passwordStrengthScore <= 1
      ? "Weak"
      : passwordStrengthScore <= 2
      ? "Fair"
      : passwordStrengthScore <= 4
      ? "Good"
      : "Strong";

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
  | OPEN DELETE ACCOUNT FORM
  |--------------------------------------------------------------------------
  */

  function openDeleteAccountForm() {
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteAccountError("");
    setShowDeletePassword(false);

    setShowDeleteAccountForm(true);
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE DELETE ACCOUNT FORM
  |--------------------------------------------------------------------------
  */

  function closeDeleteAccountForm() {
    if (deletingAccount) {
      return;
    }

    setShowDeleteAccountForm(false);

    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteAccountError("");
    setShowDeletePassword(false);
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE ACCOUNT
  |--------------------------------------------------------------------------
  */

  async function handleDeleteAccount(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (deletingAccount) {
      return;
    }

    setDeleteAccountError("");

    /*
    |--------------------------------------------------------------------------
    | Validate current password
    |--------------------------------------------------------------------------
    */

    if (!deletePassword) {
      setDeleteAccountError(
        "Please enter your current password."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate DELETE confirmation
    |--------------------------------------------------------------------------
    */

    if (deleteConfirmation !== "DELETE") {
      setDeleteAccountError(
        'Please type "DELETE" to confirm account deletion.'
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Submit deletion request
    |--------------------------------------------------------------------------
    */

    setDeletingAccount(true);

    try {
      const response = await fetch(
        "/api/settings/account",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: deletePassword,
            confirmation: deleteConfirmation,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete your account."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Account successfully deleted
      |--------------------------------------------------------------------------
      |
      | The server has already removed the session cookie.
      | Redirect the user away from the authenticated area.
      |--------------------------------------------------------------------------
      */

      setShowDeleteAccountForm(false);

      router.push("/");

      router.refresh();
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      setDeleteAccountError(
        error instanceof Error
          ? error.message
          : "Failed to delete your account. Please try again."
      );

      setDeletingAccount(false);
    }
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

    if (!hasUppercase) {
      setPasswordError(
        "Your new password must contain at least one uppercase letter."
      );

      return;
    }

    if (!hasLowercase) {
      setPasswordError(
        "Your new password must contain at least one lowercase letter."
      );

      return;
    }

    if (!hasNumber) {
      setPasswordError(
        "Your new password must contain at least one number."
      );

      return;
    }

    if (!hasSpecialCharacter) {
      setPasswordError(
        "Your new password must contain at least one special character."
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "The new passwords do not match."
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordError("");

      setPasswordSuccess(
        "Password changed successfully."
      );

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
  | PASSWORD REQUIREMENT ROW
  |--------------------------------------------------------------------------
  */

  function PasswordRequirement({
    valid,
    children,
  }: {
    valid: boolean;
    children: React.ReactNode;
  }) {
    return (
      <div
        className={`flex items-center gap-2 text-xs ${
          valid
            ? "text-green-600"
            : "text-gray-500"
        }`}
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
            valid
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {valid ? "✓" : "•"}
        </span>

        <span>{children}</span>
      </div>
    );
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
              onClick={
                openDeleteAccountForm
              }
              disabled={deletingAccount}
              className="w-full rounded-xl border border-red-500 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto"
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

            {passwordError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {passwordError}
              </div>
            )}

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
                        : passwordStrengthValid
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

                {newPassword.length > 0 && (
                  <div className="mt-3">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-xs font-medium text-gray-600">
                        Password strength
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          passwordStrengthLabel ===
                            "Strong"
                            ? "text-green-600"
                            : passwordStrengthLabel ===
                              "Good"
                            ? "text-blue-600"
                            : passwordStrengthLabel ===
                              "Fair"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {passwordStrengthLabel}
                      </span>

                    </div>

                    <div className="flex gap-1">

                      {[1, 2, 3, 4, 5].map(
                        (level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${
                              level <=
                              passwordStrengthScore
                                ? passwordStrengthScore <=
                                  2
                                  ? "bg-red-500"
                                  : passwordStrengthScore <=
                                    4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )
                      )}

                    </div>

                  </div>
                )}

                <div className="mt-3 space-y-2">

                  <p className="text-xs font-medium text-gray-600">
                    Password must contain:
                  </p>

                  <PasswordRequirement
                    valid={
                      passwordLengthValid
                    }
                  >
                    8–128 characters
                  </PasswordRequirement>

                  <PasswordRequirement
                    valid={
                      hasUppercase
                    }
                  >
                    At least one uppercase letter (A–Z)
                  </PasswordRequirement>

                  <PasswordRequirement
                    valid={
                      hasLowercase
                    }
                  >
                    At least one lowercase letter (a–z)
                  </PasswordRequirement>

                  <PasswordRequirement
                    valid={
                      hasNumber
                    }
                  >
                    At least one number (0–9)
                  </PasswordRequirement>

                  <PasswordRequirement
                    valid={
                      hasSpecialCharacter
                    }
                  >
                    At least one special character
                  </PasswordRequirement>

                </div>

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
                    !passwordStrengthValid ||
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


      {/* ================================================================== */}
      {/* DELETE ACCOUNT MODAL */}
      {/* ================================================================== */}

      {showDeleteAccountForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteAccountForm();
            }
          }}
        >

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Delete Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  This action is permanent. Your account
                  and associated account data will be deleted.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeDeleteAccountForm
                }
                disabled={
                  deletingAccount
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* WARNING */}

            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm font-semibold text-red-700">
                Warning: This cannot be undone.
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                Make sure you really want to permanently
                delete your account before continuing.
              </p>

            </div>


            {/* ERROR */}

            {deleteAccountError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {deleteAccountError}
              </div>
            )}


            <form
              onSubmit={
                handleDeleteAccount
              }
              className="space-y-5"
            >

              {/* CURRENT PASSWORD */}

              <div>

                <label
                  htmlFor="delete-account-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>

                <div className="relative">

                  <input
                    id="delete-account-password"
                    type={
                      showDeletePassword
                        ? "text"
                        : "password"
                    }
                    value={
                      deletePassword
                    }
                    onChange={(event) => {
                      setDeletePassword(
                        event.target.value
                      );

                      setDeleteAccountError("");
                    }}
                    autoComplete="current-password"
                    disabled={
                      deletingAccount
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                    placeholder="Enter your current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowDeletePassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      deletingAccount
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                  >
                    {showDeletePassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* DELETE CONFIRMATION */}

              <div>

                <label
                  htmlFor="delete-account-confirmation"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Type <span className="font-bold">DELETE</span> to confirm
                </label>

                <input
                  id="delete-account-confirmation"
                  type="text"
                  value={
                    deleteConfirmation
                  }
                  onChange={(event) => {
                    setDeleteConfirmation(
                      event.target.value
                    );

                    setDeleteAccountError("");
                  }}
                  disabled={
                    deletingAccount
                  }
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full rounded-xl border px-4 py-3 text-sm uppercase outline-none transition focus:ring-2 disabled:bg-gray-100 ${
                    deleteConfirmation.length > 0 &&
                    deleteConfirmation !==
                      "DELETE"
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : deleteConfirmation ===
                        "DELETE"
                      ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="DELETE"
                />

                {deleteConfirmation.length > 0 &&
                  deleteConfirmation !==
                    "DELETE" && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Please type DELETE exactly as shown.
                    </p>
                  )}

                {deleteConfirmation ===
                  "DELETE" && (
                  <p className="mt-2 text-xs font-medium text-green-600">
                    ✓ Confirmation accepted.
                  </p>
                )}

              </div>


              {/* ACTION BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeDeleteAccountForm
                  }
                  disabled={
                    deletingAccount
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    deletingAccount ||
                    !deletePassword ||
                    deleteConfirmation !==
                      "DELETE"
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingAccount
                    ? "Deleting Account..."
                    : "Permanently Delete Account"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}
