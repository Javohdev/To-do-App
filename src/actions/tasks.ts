"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";

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

  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    return user?.id || null;
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

  const where: any = { userId };

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status as TaskStatus;
  }

  if (filters?.priority && filters.priority !== "ALL") {
    where.priority = filters.priority as Priority;
  }

  if (filters?.search && filters.search.trim().length > 0) {
    where.title = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { status: "asc" },
      { deadline: "asc" },
      { createdAt: "desc" },
    ],
  });

  return tasks;
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
      recentActivity: [],
    };
  }

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { deadline: "asc" },
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const pending = tasks.filter((t) => t.status === TaskStatus.PENDING).length;

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Urgent tasks: 5 nearest uncompleted tasks
  const urgentTasks = tasks
    .filter((t) => t.status !== TaskStatus.COMPLETED)
    .slice(0, 5);

  // Group by priority for analytics
  const byPriority = {
    HIGH: tasks.filter((t) => t.priority === Priority.HIGH).length,
    MEDIUM: tasks.filter((t) => t.priority === Priority.MEDIUM).length,
    LOW: tasks.filter((t) => t.priority === Priority.LOW).length,
  };

  return {
    total,
    completed,
    pending,
    inProgress,
    completionRate,
    urgentTasks,
    byPriority,
  };
}

export async function createTask(input: TaskInput) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const validated = taskSchema.parse(input);
    const deadlineDate = new Date(validated.deadline);

    const task = await prisma.task.create({
      data: {
        userId,
        title: validated.title,
        description: validated.description || null,
        deadline: deadlineDate,
        priority: validated.priority as Priority,
        status: validated.status as TaskStatus,
      },
    });

    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");

    return { success: true, task };
  } catch (error: any) {
    console.error("Create task error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create task",
    };
  }
}

export async function updateTask(id: string, input: Partial<TaskInput>) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Task not found" };
    }

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.deadline !== undefined) data.deadline = new Date(input.deadline);
    if (input.priority !== undefined) data.priority = input.priority as Priority;
    if (input.status !== undefined) {
      data.status = input.status as TaskStatus;
      data.completedAt = input.status === TaskStatus.COMPLETED ? new Date() : null;
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");

    return { success: true, task: updated };
  } catch (error: any) {
    console.error("Update task error:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function toggleTaskStatus(id: string, explicitStatus?: TaskStatus) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Task not found" };
    }

    const nextStatus =
      explicitStatus ||
      (existing.status === TaskStatus.COMPLETED
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETED);

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: nextStatus,
        completedAt: nextStatus === TaskStatus.COMPLETED ? new Date() : null,
      },
    });

    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");

    return { success: true, task: updated, isCompleted: nextStatus === TaskStatus.COMPLETED };
  } catch (error: any) {
    console.error("Toggle task error:", error);
    return { success: false, error: "Failed to toggle task status" };
  }
}

export async function deleteTask(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.delete({
      where: { id },
    });

    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Delete task error:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
