import crypto from "crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/db";
import { users, sessions } from "@/db/schema";

import { comparePassword } from "@/lib/auth";
import {
  normalizeEmail,
  isValidEmail,
} from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let { email, password } = body;

    // Required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // Normalize email
    email = normalizeEmail(email);

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Invalid email address",
        },
        {
          status: 400,
        }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) =>
        eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // Check account status
    if (!user.isActive) {
      return NextResponse.json(
        {
          message: "Your account has been disabled.",
        },
        {
          status: 403,
        }
      );
    }

    // Email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          message:
            "Please verify your email before logging in.",
        },
        {
          status: 403,
        }
      );
    }

    // Verify password
    const passwordMatches =
      await comparePassword(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // Create session
    const sessionToken =
      crypto.randomBytes(48).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 7
    );

    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
    });

    // Set secure cookie
    const cookieStore = await cookies();

    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
                           }
