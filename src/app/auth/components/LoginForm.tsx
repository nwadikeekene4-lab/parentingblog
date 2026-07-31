"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
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
        "/users-dashboard"
      );

      router.refresh();

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
            placeholder="Enter your password"
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

      <div className="flex justify-end">

        <Link
          href="/forgot-password"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>

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
          ? "Logging in..."
          : "Login"}
      </button>

    </form>
  );
}
