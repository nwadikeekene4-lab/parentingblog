import { NextResponse } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
*/

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: "Forbidden.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/admin/users
|--------------------------------------------------------------------------
|
| Supports:
| - Search by display name or email
| - Role filter
| - Active/inactive filter
| - Pagination
|--------------------------------------------------------------------------
*/

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ?? "";

    const role =
      searchParams.get("role")?.trim() ?? "all";

    const status =
      searchParams.get("status")?.trim() ?? "all";

    const pageParam =
      Number(
        searchParams.get("page") ?? "1"
      );

    const limitParam =
      Number(
        searchParams.get("limit") ?? "20"
      );

    const page =
      Number.isFinite(pageParam) &&
      pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) &&
      limitParam > 0
        ? Math.min(
            Math.floor(limitParam),
            50
          )
        : 20;

    const offset =
      (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | BUILD CONDITIONS
    |--------------------------------------------------------------------------
    */

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(
            users.displayName,
            `%${search}%`
          ),
          ilike(
            users.email,
            `%${search}%`
          )
        )
      );
    }

    if (
      role === "admin" ||
      role === "user" ||
      role === "moderator"
    ) {
      conditions.push(
        eq(users.role, role)
      );
    }

    if (status === "active") {
      conditions.push(
        eq(users.isActive, true)
      );
    }

    if (status === "inactive") {
      conditions.push(
        eq(users.isActive, false)
      );
    }

    const whereCondition =
      conditions.length > 0
        ? and(...conditions)
        : undefined;

    /*
    |--------------------------------------------------------------------------
    | FETCH USERS + TOTAL
    |--------------------------------------------------------------------------
    */

    const [
      userRows,
      totalRows,
    ] = await Promise.all([
      db
        .select({
          id: users.id,
          displayName:
            users.displayName,
          email: users.email,
          profileImage:
            users.profileImage,
          role: users.role,
          emailVerified:
            users.emailVerified,
          emailNotifications:
            users.emailNotifications,
          isActive:
            users.isActive,
          createdAt:
            users.createdAt,
          updatedAt:
            users.updatedAt,
        })
        .from(users)
        .where(whereCondition)
        .orderBy(
          desc(users.createdAt),
          asc(users.displayName)
        )
        .limit(limit)
        .offset(offset),

      db
        .select({
          count: count(),
        })
        .from(users)
        .where(whereCondition),
    ]);

    const total =
      Number(
        totalRows[0]?.count ?? 0
      );

    const totalPages =
      Math.max(
        1,
        Math.ceil(total / limit)
      );

    return NextResponse.json(
      {
        users: userRows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin users GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load users.",
      },
      {
        status: 500,
      }
    );
  }
}
