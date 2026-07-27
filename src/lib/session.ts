import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: (sessions, { eq }) =>
      eq(sessions.token, sessionToken),
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, session.id));

    return null;
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.id, session.userId),
  });

  if (!user) {
    return null;
  }

  if (!user.isActive) {
    return null;
  }

  return user;
}
