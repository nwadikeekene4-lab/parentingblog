import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { normalizeEmail, isValidEmail } from "@/lib/validation";
import { generateVerificationToken, getTokenExpiry } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          message:
            "If an account exists, a verification email has been sent.",
        },
        { status: 200 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account exists, a verification email has been sent.",
        },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: "Your email is already verified.",
        },
        { status: 200 }
      );
    }

    // Remove old verification tokens
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, user.id));

    // Generate a fresh token
    const token = generateVerificationToken();

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token,
      expiresAt: getTokenExpiry(),
    });

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      message:
        "A new verification email has been sent if your account requires verification.",
    });

  } catch (error) {
    console.error("Resend verification error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
  }
