"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
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
        setError(data.message);
        return;
      }

      router.push(
        `/check-email?email=${encodeURIComponent(email)}`
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
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="Minimum 8 characters"
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

      </div>

      <div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Confirm Password
        </label>

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
          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

      </div>

      {error && (

        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>

      )}

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>

    </form>
  );
    }
