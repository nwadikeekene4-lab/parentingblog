"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type PasswordField = "current" | "new" | "confirm";

export default function AdminChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState<Record<PasswordField, boolean>>({
      current: false,
      new: false,
      confirm: false,
    });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Contains a lowercase letter",
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: "Contains a number",
      valid: /\d/.test(newPassword),
    },
    {
      label: "Contains a special character",
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const passwordStrong = passwordRequirements.every(
    (requirement) => requirement.valid
  );

  const passwordsMatch =
    newPassword.length > 0 &&
    newPassword === confirmPassword;

  function togglePassword(field: PasswordField) {
    setShowPassword((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!passwordStrong) {
      setError(
        "Please meet all the new password requirements."
      );
      return;
    }

    if (!passwordsMatch) {
      setError(
        "The new password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/settings/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json().catch(
        () => ({})
      );

      if (!response.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Unable to change your password. Please try again."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        typeof data.message === "string"
          ? data.message
          : "Your password has been changed successfully."
      );
    } catch {
      setError(
        "Unable to change your password. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function renderPasswordField(
    field: PasswordField,
    label: string,
    value: string,
    setValue: (value: string) => void,
    placeholder: string
  ) {
    const visible = showPassword[field];

    return (
      <div>
        <label
          htmlFor={`${field}-password`}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={`${field}-password`}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder={placeholder}
            autoComplete={
              field === "current"
                ? "current-password"
                : "new-password"
            }
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={() => togglePassword(field)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed"
            aria-label={
              visible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
          >
            <span aria-hidden="true">←</span>
            Back to Admin Dashboard
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
                🔐
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Change Password
                </h1>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Update your admin account password securely.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-5 py-6 sm:px-8 sm:py-8"
          >
            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
              >
                {message}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {renderPasswordField(
              "current",
              "Current Password",
              currentPassword,
              setCurrentPassword,
              "Enter your current password"
            )}

            {renderPasswordField(
              "new",
              "New Password",
              newPassword,
              setNewPassword,
              "Enter your new password"
            )}

            {newPassword.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Password requirements
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {passwordRequirements.map(
                    (requirement) => (
                      <div
                        key={requirement.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            requirement.valid
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {requirement.valid
                            ? "✓"
                            : "○"}
                        </span>

                        <span
                          className={
                            requirement.valid
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          {requirement.label}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {renderPasswordField(
              "confirm",
              "Confirm New Password",
              confirmPassword,
              setConfirmPassword,
              "Enter your new password again"
            )}

            {confirmPassword.length > 0 && (
              <p
                className={
                  passwordsMatch
                    ? "text-sm font-medium text-green-600"
                    : "text-sm font-medium text-red-600"
                }
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "Passwords do not match"}
              </p>
            )}

            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-gray-500">
          For your security, changing your password signs
          out existing sessions on other devices.
        </p>
      </div>
    </main>
  );
         }
