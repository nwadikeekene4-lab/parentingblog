"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setMessageType("success");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage("Please enter your email address.");
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
            "Content-Type": "application/json",
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
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0">

        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />

        {/* Soft blue glow */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Purple glow */}
        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-purple-500/20 blur-3xl" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

      </div>


      {/* ================= CONTENT ================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">

        <div className="w-full max-w-md">

          {/* Brand */}
          <div className="mb-6 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7 text-blue-300"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s-7-4.35-9.5-9.15C.55 8.1 2.8 4.5 6.6 4.5c2.15 0 4.05 1.15 5.4 2.9 1.35-1.75 3.25-2.9 5.4-2.9 3.8 0 6.05 3.6 4.1 7.35C19 16.65 12 21 12 21Z"
                />
              </svg>

            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              Parenting Together
            </h1>

            <p className="mt-1 text-sm text-blue-200/80">
              Learn, Share and Grow Together
            </p>

          </div>


          {/* ================= CARD ================= */}

          <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-2xl">

            {/* Card top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500" />

            <div className="p-6 sm:p-8">

              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-300/20">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-8 w-8 text-blue-300"
                  aria-hidden="true"
                >
                  <rect
                    width="14"
                    height="10"
                    x="5"
                    y="10"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10V7.5a4 4 0 0 1 8 0V10"
                  />

                  <path
                    strokeLinecap="round"
                    d="M12 14v2"
                  />
                </svg>

              </div>


              {/* Heading */}
              <div className="mt-6 text-center">

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Forgot your password?
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
                  Don't worry. Enter the email address
                  associated with your account and we'll
                  help you get back into your account.
                </p>

              </div>


              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    {/* Email icon */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect
                          width="20"
                          height="16"
                          x="2"
                          y="4"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7"
                        />
                      </svg>

                    </div>


                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      disabled={loading}
                      autoComplete="email"
                      required
                      className="h-13 w-full rounded-xl border border-white/15 bg-white/[0.08] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:bg-white/[0.12] focus:ring-4 focus:ring-blue-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                  </div>

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-900/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link

                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>


              {/* Message */}
              {message && (
                <div
                  className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm leading-5 ${
                    messageType === "success"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                  }`}
                  role="alert"
                >

                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                    {messageType === "success"
                      ? "✓"
                      : "!"}
                  </span>

                  <p>{message}</p>

                </div>
              )}


              {/* Back to auth */}
              <div className="mt-7 text-center">

                <Link
                  href="/auth"
                  className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-white/5 hover:text-blue-200"
                >

                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                  >
                    ←
                  </span>

                  Back to Login

                </Link>

              </div>

            </div>

          </section>


          {/* Security note */}
          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9.5 12 1.7 1.7 3.5-3.5"
              />
            </svg>

            <span>
              Your password and reset information are
              protected.
            </span>

          </div>

        </div>

      </div>

    </main>
  );
    }
