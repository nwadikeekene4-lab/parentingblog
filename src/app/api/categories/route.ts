import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        isActive: categories.isActive,
      })
      .from(categories)
      .orderBy(asc(categories.displayOrder));

    return NextResponse.json({
      categories: result,
    });
  } catch (error) {
    console.error("Fetch categories error:", error);

    return NextResponse.json(
      {
        message: "Unable to fetch categories.",
      },
      {
        status: 500,
      }
    );
  }
        }
