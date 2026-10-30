"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { mockTasks } from "@/lib/demo-store";

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
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      return user?.id || session.user.email;
    } catch {
      return session.user.email;
    }
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

  // Try Prisma first
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
    // Database offline, use mock store
  }

  // Get user's tasks from mock store
  let list = mockTasks.filter(
    (t) => t.userId === userId || (userId.startsWith("user-") && t.userId === userId) || (userId === "demo-user-id" && t.userId === "demo-user-id")
  );

  // If new user has no tasks yet, give them their tasks or default
  if (list.length === 0) {
    list = mockTasks.filter((t) => t.userId === userId);
  }

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
    tasks = mockTasks.filter((t) => t.userId === userId);
    if (tasks.length === 0 && (userId === "demo-user-id" || userId.startsWith("user-"))) {
      tasks = mockTasks.filter((t) => t.userId === userId || t.userId === "demo-user-id");
    }
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

    try {
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
    } catch (dbError) {
      // Mock store fallback
      const newTask = {
        id: `task-${Date.now()}`,
        userId,
        title: validated.title,
        description: validated.description || null,
        deadline: deadlineDate,
        priority: validated.priority as any,
        status: validated.status as any,
        completedAt: validated.status === "COMPLETED" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTasks.unshift(newTask);

      revalidatePath("/[locale]/dashboard", "page");
      revalidatePath("/[locale]/tasks", "page");
      return { success: true, task: newTask };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create task" };
  }
}

export async function updateTask(id: string, input: Partial<TaskInput>) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Try Prisma
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (existing) {
      const data: any = {};
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.deadline !== undefined) data.deadline = new Date(input.deadline);
      if (input.priority !== undefined) data.priority = input.priority as Priority;
      if (input.status !== undefined) {
        data.status = input.status as TaskStatus;
        data.completedAt = input.status === TaskStatus.COMPLETED ? new Date() : null;
      }
      const updated = await prisma.task.update({ where: { id }, data });
      revalidatePath("/[locale]/dashboard", "page");
      revalidatePath("/[locale]/tasks", "page");
      return { success: true, task: updated };
    }
  } catch {
    // Database offline, check mock store
  }

  // Update in mock store
  const index = mockTasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    mockTasks[index] = {
      ...mockTasks[index],
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : mockTasks[index].deadline,
      completedAt: input.status === "COMPLETED" ? new Date() : input.status ? null : mockTasks[index].completedAt,
    };
    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");
    return { success: true, task: mockTasks[index] };
  }

  return { success: false, error: "Task not found" };
}

export async function toggleTaskStatus(id: string, explicitStatus?: TaskStatus) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (existing) {
      const nextStatus =
        explicitStatus ||
        (existing.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED);

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
    }
  } catch {
    // Check mock store
  }

  const task = mockTasks.find((t) => t.id === id);
  if (task) {
    const nextStatus =
      explicitStatus ||
      (task.status === "COMPLETED" ? "PENDING" : "COMPLETED");
    task.status = nextStatus as any;
    task.completedAt = nextStatus === "COMPLETED" ? new Date() : null;
    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");
    return { success: true, task, isCompleted: nextStatus === "COMPLETED" };
  }

  return { success: false, error: "Task not found" };
}

export async function deleteTask(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch {
    // Check mock store
  }

  const initialLen = mockTasks.length;
  const filtered = mockTasks.filter((t) => t.id !== id);
  mockTasks.length = 0;
  mockTasks.push(...filtered);

  revalidatePath("/[locale]/dashboard", "page");
  revalidatePath("/[locale]/tasks", "page");
  return { success: true };
}
