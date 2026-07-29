"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function CheckEmailContent() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResendVerification() {
    if (!email) {
      setMessage("Email address is missing.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      setMessage(data.message);

    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-100 px-4 py-10">

      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

      <section className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">

        <div className="mb-8 text-center">

          <div className="mb-4 text-5xl">
            📧
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Check your email
          </h1>

          <p className="mt-4 text-gray-600">
            We've sent a verification link to:
          </p>

          <p className="mt-2 break-all font-semibold text-blue-700">
            {email ?? "your email"}
          </p>

        </div>

        <div className="space-y-4 rounded-xl bg-blue-50 p-5 text-sm text-gray-700">

          <p>
            Click the verification link in the email to activate your account.
          </p>

          <p>
            If you don't see it within a few minutes, check your Spam or Junk folder.
          </p>

        </div>

        {message && (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-8 space-y-3">

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Sending..."
              : "Resend Verification Email"}
          </button>

          <Link
            href="/login"
            className="block h-12 rounded-xl border border-gray-300 text-center leading-[48px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to Login
          </Link>

        </div>

      </section>

    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          Loading...
        </main>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
                 }
