"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockUsers } from "@/lib/demo-store";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const sessionEmail = session.user.email?.toLowerCase().trim();
  const sessionId = session.user.id;

  // Check mock store first
  const mockFound = mockUsers.find(
    (u) => u.id === sessionId || (sessionEmail && u.email === sessionEmail)
  );

  if (mockFound) {
    return {
      id: mockFound.id,
      name: mockFound.name,
      email: mockFound.email,
      image: mockFound.image || null,
      preferences: {
        theme: "system",
        language: "uz",
      },
    };
  }

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
      id: sessionId || "demo-user-id",
      name: session.user.name || "Foydalanuvchi",
      email: session.user.email || "",
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
