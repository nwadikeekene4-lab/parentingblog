"use client";

import { useState } from "react";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <main
      className="
        min-h-screen
        bg-cover
        bg-center
        bg-fixed
        relative
        flex
        items-center
        justify-center
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
      />


      <section
        className="
          relative
          z-10
          w-full
          max-w-xl
          rounded-3xl
          bg-white/95
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
        "
      >

        {/* Header */}

        <div
          className="
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            px-8
            py-8
            text-center
          "
        >

          <h1 className="text-3xl font-bold text-white">
            Parenting Together
          </h1>

          <p className="mt-3 text-blue-100">
            Learn, Share and Grow Together
          </p>

        </div>


        {/* Tabs */}

        <div className="flex border-b">

          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-4 font-semibold transition ${
              mode === "login"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Login
          </button>


          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-4 font-semibold transition ${
              mode === "signup"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Create Account
          </button>

        </div>


        <div className="p-8">

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
