import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/actions/user";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { TaskProvider } from "@/context/task-context";
import { getTasks } from "@/actions/tasks";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const dbUser = await getCurrentUser();
  const userId = dbUser?.id || session.user.id || session.user.email || "user";
  const user = {
    name: dbUser?.name || session.user.name || "Foydalanuvchi",
    email: dbUser?.email || session.user.email || "",
    image: dbUser?.image || session.user.image || null,
  };

  // Fetch initial tasks (if database is connected)
  const initialTasks = await getTasks();
  const serializedTasks = initialTasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description || null,
    status: t.status,
    priority: t.priority,
    deadline: typeof t.deadline === "string" ? t.deadline : t.deadline.toISOString(),
    completedAt: t.completedAt ? (typeof t.completedAt === "string" ? t.completedAt : t.completedAt.toISOString()) : null,
    userId,
    createdAt: typeof t.createdAt === "string" ? t.createdAt : t.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: typeof t.updatedAt === "string" ? t.updatedAt : t.updatedAt?.toISOString?.() || new Date().toISOString(),
  }));

  return (
    <TaskProvider userId={userId} initialTasks={serializedTasks}>
      <div className="flex min-h-screen bg-muted/20 w-full overflow-x-hidden">
        <Sidebar user={user} />
        <main className="flex-1 min-w-0 pt-16 lg:pt-0 p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </TaskProvider>
  );
}
