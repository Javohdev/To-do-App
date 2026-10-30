"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { findUserByEmail, saveUser } from "@/lib/demo-store";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(input: RegisterInput) {
  try {
    const validated = registerSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Validation failed",
      };
    }

    const { name, email, password } = validated.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check in persistent store first
    const existingInStore = findUserByEmail(cleanEmail);
    if (existingInStore) {
      return {
        success: false,
        error: "This email is already registered",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Stable deterministic ID based on email
    const cleanPrefix = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const stableUserId = `usr_${cleanPrefix}_${Buffer.from(cleanEmail).toString("hex").slice(0, 10)}`;

    // If external cloud DB is configured (Render, Supabase, Neon):
    const hasExternalDb =
      process.env.DATABASE_URL &&
      !process.env.DATABASE_URL.includes("localhost:5432");

    if (hasExternalDb) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (existingUser) {
          return {
            success: false,
            error: "This email is already registered",
          };
        }

        const user = await prisma.user.create({
          data: {
            id: stableUserId,
            name,
            email: cleanEmail,
            password: hashedPassword,
            preferences: {
              create: {
                theme: "system",
                language: "uz",
              },
            },
          },
        });

        saveUser({
          id: user.id,
          name,
          email: cleanEmail,
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString(),
        });

        return {
          success: true,
          userId: user.id,
        };
      } catch (err) {
        console.warn("External DB connection failed, falling back to persistent store:", err);
      }
    }

    // Persistent storage with stable ID
    const newUser = {
      id: stableUserId,
      name,
      email: cleanEmail,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);

    return {
      success: true,
      userId: stableUserId,
    };
  } catch (error: any) {
    console.error("Error registering user:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
