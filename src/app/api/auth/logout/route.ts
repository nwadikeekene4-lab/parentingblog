import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions } from "@/db/schema";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("session")?.value;

    if (sessionToken) {
      await db
        .delete(sessions)
        .where(
          eq(sessions.token, sessionToken)
        );
    }

    cookieStore.delete("session");

    return NextResponse.json(
      {
        message: "Logged out successfully",
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
