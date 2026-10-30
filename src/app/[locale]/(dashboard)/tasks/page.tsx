import * as React from "react";
import { getTasks } from "@/actions/tasks";
import { TaskList } from "@/components/task-list";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* Task List Component with Search, Filter & Modals */}
      <TaskList initialTasks={serializedTasks as any} />
    </div>
  );
}
