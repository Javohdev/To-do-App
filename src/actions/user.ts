"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) return null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ id: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    include: {
      preferences: true,
    },
  });

  return user;
}

export async function updateUserPreference(data: {
  theme?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ id: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
  });

  if (!user) return { success: false, error: "User not found" };

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
}
