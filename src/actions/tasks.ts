"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import {
  getUserTasks,
  saveTask,
  updateStoredTask,
  removeStoredTask,
  findUserByEmail,
} from "@/lib/demo-store";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  deadline: z.string().or(z.date()),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
});

export type TaskInput = z.infer<typeof taskSchema>;

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.id) return session.user.id;

  const sessionEmail = session.user.email?.toLowerCase().trim();
  if (sessionEmail) {
    const localUser = findUserByEmail(sessionEmail);
    if (localUser) return localUser.id;

    try {
      const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true },
      });
      if (user?.id) return user.id;
    } catch {
      // ignore
    }
    return sessionEmail;
  }

  return null;
}

export async function getTasks(filters?: {
  status?: string;
  search?: string;
  priority?: string;
}) {
  const userId = await getAuthUserId();
  if (!userId) return [];

  // Try Prisma first if external DB is active
  try {
    const where: any = { userId };
    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status as TaskStatus;
    }
    if (filters?.priority && filters.priority !== "ALL") {
      where.priority = filters.priority as Priority;
    }
    if (filters?.search && filters.search.trim()) {
      where.title = {
        contains: filters.search.trim(),
        mode: "insensitive",
      };
    }
    const dbTasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { deadline: "asc" },
        { createdAt: "desc" },
      ],
    });
    if (dbTasks && dbTasks.length > 0) {
      return dbTasks;
    }
  } catch (error) {
    // DB offline, fall through to persistent store
  }

  // Persistent store
  let list = getUserTasks(userId);

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== "ALL") {
    list = list.filter((t) => t.priority === filters.priority);
  }
  if (filters?.search && filters.search.trim()) {
    list = list.filter((t) =>
      t.title.toLowerCase().includes(filters.search!.toLowerCase().trim())
    );
  }

  return list;
}

export async function getDashboardData() {
  const userId = await getAuthUserId();
  if (!userId) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      completionRate: 0,
      urgentTasks: [],
    };
  }

  let tasks: any[] = [];

  try {
    tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { deadline: "asc" },
    });
  } catch {
    tasks = [];
  }

  if (tasks.length === 0) {
    tasks = getUserTasks(userId);
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const urgentTasks = tasks
    .filter((t) => t.status !== "COMPLETED")
    .slice(0, 5);

  return {
    total,
    completed,
    pending,
    inProgress,
    completionRate,
    urgentTasks,
  };
}

export async function createTask(input: TaskInput) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const validated = taskSchema.parse(input);
    const deadlineDate = new Date(validated.deadline);
    const deadlineIso = deadlineDate.toISOString();

    // 1. Always save to persistent local store immediately for instant updates
    const newTask = {
      id: `task-${Date.now()}`,
      userId,
      title: validated.title,
      description: validated.description || null,
      deadline: deadlineIso,
      priority: validated.priority as any,
      status: validated.status as any,
      completedAt: validated.status === "COMPLETED" ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTask(newTask);

    // 2. Also save to Prisma if DB is available
    try {
      await prisma.task.create({
        data: {
          id: newTask.id,
          userId,
          title: validated.title,
          description: validated.description || null,
          deadline: deadlineDate,
          priority: validated.priority as Priority,
          status: validated.status as TaskStatus,
        },
      });
    } catch {
      // Persistent file already saved
    }

    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");
    return { success: true, task: newTask };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create task" };
  }
}

export async function updateTask(id: string, input: Partial<TaskInput>) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const updates: any = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.deadline !== undefined) updates.deadline = new Date(input.deadline).toISOString();
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.status !== undefined) {
    updates.status = input.status;
    updates.completedAt = input.status === "COMPLETED" ? new Date().toISOString() : null;
  }

  const updatedLocal = updateStoredTask(id, updates);

  // Also update DB
  try {
    const dbData: any = { ...updates };
    if (updates.deadline) dbData.deadline = new Date(updates.deadline);
    if (updates.completedAt) dbData.completedAt = new Date(updates.completedAt);
    await prisma.task.update({ where: { id }, data: dbData });
  } catch {
    // ignore
  }

  revalidatePath("/[locale]/dashboard", "page");
  revalidatePath("/[locale]/tasks", "page");
  return { success: true, task: updatedLocal };
}

export async function toggleTaskStatus(id: string, explicitStatus?: TaskStatus) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const currentTasks = getUserTasks(userId);
  const task = currentTasks.find((t) => t.id === id);

  let nextStatus: TaskStatus = TaskStatus.COMPLETED;
  if (explicitStatus) {
    nextStatus = explicitStatus;
  } else if (task) {
    nextStatus = task.status === "COMPLETED" ? TaskStatus.PENDING : TaskStatus.COMPLETED;
  }

  const completedAt = nextStatus === TaskStatus.COMPLETED ? new Date().toISOString() : null;

  updateStoredTask(id, {
    status: nextStatus as any,
    completedAt,
  });

  try {
    await prisma.task.update({
      where: { id },
      data: {
        status: nextStatus,
        completedAt: nextStatus === TaskStatus.COMPLETED ? new Date() : null,
      },
    });
  } catch {
    // ignore
  }

  revalidatePath("/[locale]/dashboard", "page");
  revalidatePath("/[locale]/tasks", "page");
  return { success: true, isCompleted: nextStatus === TaskStatus.COMPLETED };
}

export async function deleteTask(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  removeStoredTask(id);

  try {
    await prisma.task.delete({ where: { id } });
  } catch {
    // ignore
  }

  revalidatePath("/[locale]/dashboard", "page");
  revalidatePath("/[locale]/tasks", "page");
  return { success: true };
}
