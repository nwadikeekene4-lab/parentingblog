"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      router.push("/");
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-100 px-4 py-10">

      {/* Decorative background shapes */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />


      <section className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            Login to continue your Parenting Blog journey.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
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
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-20 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
              >
                {showPassword ? "Hide" : "Show"}
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
            className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>


        </form>


        <div className="mt-8 text-center text-sm text-gray-600">

          Don't have an account?{" "}

          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create one
          </Link>

        </div>


      </section>

    </main>
  );
        }
