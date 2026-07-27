"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setMessage("Verification token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${token}`
        );

        const data = await response.json();

        setMessage(data.message);

        if (response.ok) {
          setSuccess(true);
        }
      } catch {
        setMessage(
          "Something went wrong. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="mb-6 text-center text-3xl font-bold">
          Email Verification
        </h1>

        {loading ? (
          <p className="text-center">
            Verifying your email...
          </p>
        ) : (
          <>
            <p className="mb-6 text-center">
              {message}
            </p>

            {success ? (
              <Link
                href="/login"
                className="block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Continue to Login
              </Link>
            ) : (
              <Link
                href="/"
                className="block rounded-lg border py-3 text-center font-semibold transition hover:bg-gray-100"
              >
                Back to Home
              </Link>
            )}
          </>
        )}

      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
