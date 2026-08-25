"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setMessageType("success");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage(
        "Please enter your email address."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data?.message ||
            "We couldn't process your request. Please try again."
        );
        setMessageType("error");
        return;
      }

      setMessage(
        data?.message ||
          "Password reset instructions have been sent to your email address. Please check your inbox and spam folder."
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Forgot password request error:",
        error
      );

      setMessage(
        "Unable to connect to the server. Please check your internet connection and try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          Forgot Password
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Enter your email address and we'll
          send you a password reset link.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            disabled={loading}
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
          }
