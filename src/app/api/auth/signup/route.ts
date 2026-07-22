import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      displayName,
      email,
      password,
    } = body;


    // Basic validation
    if (!displayName || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }


    // Password length protection
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }


    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) =>
        eq(users.email, email),
    });


    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        {
          status: 409,
        }
      );
    }


    const passwordHash = await hashPassword(password);


    const newUser = await db
      .insert(users)
      .values({
        displayName,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
      });


    return NextResponse.json(
      {
        message: "Account created successfully",
        user: newUser[0],
      },
      {
        status: 201,
      }
    );


  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
        }
