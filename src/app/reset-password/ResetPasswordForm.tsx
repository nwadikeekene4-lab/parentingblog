"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | PASSWORD VALIDATION
  |--------------------------------------------------------------------------
  */

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasLowercase =
    /[a-z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  const hasSpecialCharacter =
    /[^A-Za-z0-9]/.test(password);

  const passwordLengthValid =
    password.length >= 8 &&
    password.length <= 128;

  const passwordTooLong =
    password.length > 128;

  const passwordStrengthValid =
    passwordLengthValid &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter;

  /*
  |--------------------------------------------------------------------------
  | PASSWORD STRENGTH SCORE
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
    password.length === 0
      ? ""
      : passwordStrengthScore <= 1
      ? "Weak"
      : passwordStrengthScore === 2
      ? "Fair"
      : passwordStrengthScore <= 4
      ? "Good"
      : "Strong";

  /*
  |--------------------------------------------------------------------------
  | PASSWORD MATCH
  |--------------------------------------------------------------------------
  */

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

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
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (!token) {
      setMessage(
        "Invalid or missing reset token."
      );
      return;
    }

    if (!password) {
      setMessage(
        "Please enter a new password."
      );
      return;
    }

    if (!passwordLengthValid) {
      setMessage(
        passwordTooLong
          ? "Password cannot exceed 128 characters."
          : "Password must be at least 8 characters long."
      );
      return;
    }

    if (!hasUppercase) {
      setMessage(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!hasLowercase) {
      setMessage(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!hasNumber) {
      setMessage(
        "Password must contain at least one number."
      );
      return;
    }

    if (!hasSpecialCharacter) {
      setMessage(
        "Password must contain at least one special character."
      );
      return;
    }

    if (!confirmPassword) {
      setMessage(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to reset password."
        );
        return;
      }

      setMessage(
        data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Reset Password
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Enter your new password below.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* NEW PASSWORD */}

          <div>

            <label
              htmlFor="reset-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>

            <div className="relative">

              <input
                id="reset-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                className={`w-full rounded-xl border px-4 py-3 pr-20 text-sm outline-none transition focus:ring-2 disabled:bg-gray-100 ${
                  password.length > 0 &&
                  !passwordStrengthValid
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : passwordStrengthValid
                    ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  setMessage("");
                }}
                autoComplete="new-password"
                required
                maxLength={128}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            {/* PASSWORD STRENGTH */}

            {password.length > 0 && (
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


                {/* STRENGTH BAR */}

                <div className="flex gap-1">

                  {[1, 2, 3, 4, 5].map(
                    (level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full ${
                          level <=
                          passwordStrengthScore
                            ? passwordStrengthScore <=
                              1
                              ? "bg-red-500"
                              : passwordStrengthScore ===
                                2
                              ? "bg-yellow-500"
                              : passwordStrengthScore <=
                                4
                              ? "bg-blue-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )
                  )}

                </div>

              </div>
            )}


            {/* PASSWORD REQUIREMENTS */}

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
              htmlFor="reset-confirm-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>

            <div className="relative">

              <input
                id="reset-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Retype new password"
                className={`w-full rounded-xl border px-4 py-3 pr-20 text-sm outline-none transition focus:ring-2 disabled:bg-gray-100 ${
                  passwordsDoNotMatch
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : passwordsMatch
                    ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(
                    e.target.value
                  );
                  setMessage("");
                }}
                autoComplete="new-password"
                required
                maxLength={128}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            {/* MATCH MESSAGE */}

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


          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            disabled={
              loading ||
              !token ||
              !passwordStrengthValid ||
              password !==
                confirmPassword
            }
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>


        {/* MESSAGE */}

        {message && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              message
                .toLowerCase()
                .includes("success")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

      </div>

    </main>
  );
         }
