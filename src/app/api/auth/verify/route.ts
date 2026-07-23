import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  emailVerificationTokens,
} from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Verification token is required." },
        { status: 400 }
      );
    }

    const verificationToken =
      await db.query.emailVerificationTokens.findFirst({
        where: (emailVerificationTokens, { eq }) =>
          eq(emailVerificationTokens.token, token),
      });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid verification token." },
        { status: 404 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      await db
        .delete(emailVerificationTokens)
        .where(
          eq(
            emailVerificationTokens.id,
            verificationToken.id
          )
        );

      return NextResponse.json(
        { message: "Verification token has expired." },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(
        eq(users.id, verificationToken.userId)
      );

    await db
      .delete(emailVerificationTokens)
      .where(
        eq(
          emailVerificationTokens.id,
          verificationToken.id
        )
      );

    return NextResponse.json(
      {
        message: "Email verified successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
        }
