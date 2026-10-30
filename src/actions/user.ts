"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findUserByEmail, findUserById } from "@/lib/demo-store";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const sessionEmail = session.user.email?.toLowerCase().trim();
  const sessionId = session.user.id;

  // 1. Check persistent store
  if (sessionId) {
    const byId = findUserById(sessionId);
    if (byId) {
      return {
        id: byId.id,
        name: byId.name,
        email: byId.email,
        image: byId.image || null,
        preferences: {
          theme: "system",
          language: "uz",
        },
      };
    }
  }

  if (sessionEmail) {
    const byEmail = findUserByEmail(sessionEmail);
    if (byEmail) {
      return {
        id: byEmail.id,
        name: byEmail.name,
        email: byEmail.email,
        image: byEmail.image || null,
        preferences: {
          theme: "system",
          language: "uz",
        },
      };
    }
  }

  // 2. Check Prisma DB
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(sessionId ? [{ id: sessionId }] : []),
          ...(sessionEmail ? [{ email: sessionEmail }] : []),
        ],
      },
      include: {
        preferences: true,
      },
    });

    return user;
  } catch (err) {
    return {
      id: sessionId || `user-${sessionEmail || "guest"}`,
      name: session.user.name || (sessionEmail ? sessionEmail.split("@")[0] : "Foydalanuvchi"),
      email: sessionEmail || "",
      image: session.user.image || null,
      preferences: null,
    };
  }
}

export async function updateUserPreference(data: {
  theme?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.user.id ? [{ id: session.user.id }] : []),
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
    });

    if (!user) return { success: true };

    await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: data.theme || "system",
        language: data.language || "uz",
      },
      update: {
        ...(data.theme ? { theme: data.theme } : {}),
        ...(data.language ? { language: data.language } : {}),
      },
    });

    return { success: true };
  } catch {
    return { success: true };
  }
}
