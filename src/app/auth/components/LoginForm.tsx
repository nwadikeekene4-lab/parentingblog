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

    if (loading) return;

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      let data: {
        message?: string;
      } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to log in. Please check your details and try again."
        );
        return;
      }

      router.push("/users-dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "Login request error:",
        error
      );

      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate={false}
    >
      {/* Email */}

      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Email Address
        </label>

        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          disabled={loading}
          required
          className="
            h-12
            w-full
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            text-gray-900
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
            disabled:cursor-not-allowed
            disabled:bg-gray-50
            disabled:opacity-70
          "
        />
      </div>

      {/* Password */}

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="login-password"
            name="password"
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
            autoComplete="current-password"
            disabled={loading}
            required
            className="
              h-12
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              pr-20
              text-gray-900
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
              disabled:cursor-not-allowed
              disabled:bg-gray-50
              disabled:opacity-70
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            disabled={loading}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-lg
              px-2
              py-1
              text-sm
              font-semibold
              text-blue-600
              transition
              hover:bg-blue-50
              hover:text-blue-800
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Forgot Password */}

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="
            rounded-md
            text-sm
            font-semibold
            text-blue-600
            transition
            hover:text-blue-800
            hover:underline
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:ring-offset-2
          "
        >
          Forgot Password?
        </Link>
      </div>

      {/* Error */}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* Login Button */}

      <button
        type="submit"
        disabled={loading}
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          rounded-xl
          bg-blue-600
          font-semibold
          text-white
          shadow-sm
          transition
          duration-200
          hover:bg-blue-700
          hover:shadow-md
          active:scale-[0.98]
          focus:outline-none
          focus:ring-4
          focus:ring-blue-200
          disabled:cursor-not-allowed
          disabled:opacity-60
          disabled:hover:bg-blue-600
        "
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-white/40
                border-t-white
              "
            />

            Logging in...
          </span>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
    }
