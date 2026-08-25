"use client";

import { useState } from "react";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";

export default function AuthPage() {
  const [mode, setMode] = useState<
    "login" | "signup"
  >("login");

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-cover
        bg-center
        bg-fixed
        px-4
        py-10
      "
      style={{
        backgroundImage:
          "url('/Images/loginimage.png')",
      }}
    >
      {/* Background overlay */}
      <div
        className="
          absolute
          inset-0
          bg-black/45
          backdrop-blur-[2px]
        "
        aria-hidden="true"
      />

      {/* Authentication card */}
      <section
        className="
          relative
          z-10
          w-full
          max-w-xl
          overflow-hidden
          rounded-3xl
          bg-white/95
          shadow-2xl
          backdrop-blur-xl
        "
      >
        {/* Header */}
        <div
          className="
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            px-6
            py-7
            text-center
            sm:px-8
            sm:py-8
          "
        >
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-white
              sm:text-3xl
            "
          >
            Parenting Together
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-blue-100
              sm:mt-3
              sm:text-base
            "
          >
            Learn, Share and Grow Together
          </p>
        </div>

        {/* Login / Create Account tabs */}
        <div
          className="flex border-b border-gray-200"
          role="tablist"
          aria-label="Authentication"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
            className={`
              flex-1
              border-b-4
              px-4
              py-4
              text-sm
              font-semibold
              transition
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-inset
              focus:ring-blue-500
              sm:text-base
              ${
                mode === "login"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }
            `}
          >
            Login
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => setMode("signup")}
            className={`
              flex-1
              border-b-4
              px-4
              py-4
              text-sm
              font-semibold
              transition
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-inset
              focus:ring-blue-500
              sm:text-base
              ${
                mode === "signup"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }
            `}
          >
            Create Account
          </button>
        </div>

        {/* Form area */}
        <div
          className="
            p-5
            sm:p-8
          "
        >
          {mode === "login" ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}
        </div>
      </section>
    </main>
  );
        }
