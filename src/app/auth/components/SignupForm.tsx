"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [displayName, setDisplayName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | PASSWORD STRENGTH
  |--------------------------------------------------------------------------
  */

  const hasMinimumLength =
    password.length >= 8;

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasLowercase =
    /[a-z]/.test(password);

  const hasNumber =
    /\d/.test(password);

  const passwordIsStrong =
    hasMinimumLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber;


  /*
  |--------------------------------------------------------------------------
  | PASSWORD MATCH
  |--------------------------------------------------------------------------
  */

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");


    /*
    |--------------------------------------------------------------------------
    | Check password strength
    |--------------------------------------------------------------------------
    */

    if (!passwordIsStrong) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number."
      );

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Check password confirmation
    |--------------------------------------------------------------------------
    */

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await fetch(
          "/api/auth/signup",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              displayName,
              email,
              password,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
            "Unable to create account."
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Account created successfully
      |--------------------------------------------------------------------------
      */

      router.push(
        `/check-email?email=${encodeURIComponent(
          email
        )}`
      );


    } catch {

      setError(
        "Something went wrong. Please try again."
      );


    } finally {

      setLoading(false);

    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* DISPLAY NAME */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Display Name
        </label>

        <input
          type="text"
          value={displayName}
          onChange={(e) =>
            setDisplayName(
              e.target.value
            )
          }
          placeholder="Enter your display name"
          required
          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

      </div>


      {/* EMAIL */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Email Address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          placeholder="you@example.com"
          required
          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

      </div>


      {/* PASSWORD */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Password
        </label>

        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(e) => {
              setPassword(
                e.target.value
              );

              if (error) {
                setError("");
              }
            }}
            placeholder="Create a strong password"
            required
            className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-20 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />


          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </button>

        </div>


        {/* PASSWORD REQUIREMENTS */}

        <div className="mt-3 rounded-xl bg-gray-50 p-4">

          <p className="mb-3 text-sm font-semibold text-gray-700">
            Password must contain:
          </p>


          <div className="space-y-2 text-sm">

            <PasswordRequirement
              valid={
                hasMinimumLength
              }
              text="At least 8 characters"
            />

            <PasswordRequirement
              valid={
                hasUppercase
              }
              text="At least one uppercase letter"
            />

            <PasswordRequirement
              valid={
                hasLowercase
              }
              text="At least one lowercase letter"
            />

            <PasswordRequirement
              valid={
                hasNumber
              }
              text="At least one number"
            />

          </div>

        </div>

      </div>


      {/* CONFIRM PASSWORD */}

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Confirm Password
        </label>


        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            placeholder="Confirm password"
            required
            className={`h-12 w-full rounded-xl border px-4 pr-20 outline-none transition focus:ring-4 ${
              passwordsMatch
                ? "border-green-500 focus:border-green-500 focus:ring-green-100"
                : passwordsDoNotMatch
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />


          {confirmPassword.length >
            0 && (

            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium ${
                passwordsMatch
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {passwordsMatch
                ? "Match"
                : "No match"}
            </span>

          )}

        </div>


        {passwordsDoNotMatch && (

          <p className="mt-2 text-xs text-red-600">
            Passwords do not match.
          </p>

        )}


        {passwordsMatch && (

          <p className="mt-2 text-xs text-green-600">
            Passwords match.
          </p>

        )}

      </div>


      {/* ERROR */}

      {error && (

        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>

      )}


      {/* CREATE ACCOUNT */}

      <button
        type="submit"
        disabled={
          loading ||
          !passwordIsStrong ||
          !passwordsMatch
        }
        className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>

    </form>
  );
}


/*
|--------------------------------------------------------------------------
| PASSWORD REQUIREMENT
|--------------------------------------------------------------------------
*/

function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        valid
          ? "text-green-600"
          : "text-gray-500"
      }`}
    >

      <span className="flex h-5 w-5 items-center justify-center font-bold">
        {valid
          ? "✓"
          : "○"}
      </span>

      <span>
        {text}
      </span>

    </div>
  );
      }
