import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";

import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const token = searchParams.get("token");


    if (!token) {
      return NextResponse.json(
        {
          message: "Verification token is missing",
        },
        {
          status: 400,
        }
      );
    }


    const verificationRecord = await db.query.emailVerificationTokens.findFirst({
      where: (tokens, { eq }) =>
        eq(tokens.token, token),
    });


    if (!verificationRecord) {
      return NextResponse.json(
        {
          message: "Invalid verification token",
        },
        {
          status: 400,
        }
      );
    }


    // Check token expiry
    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.json(
        {
          message: "Verification token has expired",
        },
        {
          status: 400,
        }
      );
    }


    // Verify the user email
    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(
        eq(users.id, verificationRecord.userId)
      );


    // Delete used token so it cannot be reused
    await db
      .delete(emailVerificationTokens)
      .where(
        eq(emailVerificationTokens.id, verificationRecord.id)
      );


    return NextResponse.json(
      {
        message: "Email verified successfully",
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
