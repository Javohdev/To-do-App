import * as React from "react";
import { getTasks } from "@/actions/tasks";
import { TaskList } from "@/components/task-list";
import { getTranslations } from "next-intl/server";

export default async function TasksPage() {
  const t = await getTranslations("tasks");
  const rawTasks = await getTasks();

  const serializedTasks = rawTasks.map((task: any) => ({
    ...task,
    deadline: typeof task.deadline === "string" ? task.deadline : task.deadline.toISOString(),
    createdAt: typeof task.createdAt === "string" ? task.createdAt : task.createdAt?.toISOString?.() || new Date().toISOString(),
    completedAt: task.completedAt ? (typeof task.completedAt === "string" ? task.completedAt : task.completedAt.toISOString()) : null,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Task List Component with Search, Filter & Modals */}
      <TaskList initialTasks={serializedTasks as any} />
    </div>
  );
}
