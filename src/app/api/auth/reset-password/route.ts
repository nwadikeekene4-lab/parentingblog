import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { passwordResetTokens, users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    if (new Date() > resetToken.expiresAt) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    // Log out all devices after password change
    await db
      .delete(sessions)
      .where(eq(sessions.userId, resetToken.userId));

    // Delete used reset token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({
      message: "Password reset successful. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
  }
