"use client";

import * as React from "react";

export interface ClientTask {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: string;
  completedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskContextType {
  tasks: ClientTask[];
  isLoading: boolean;
  createTask: (data: {
    title: string;
    description?: string | null;
    deadline: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  }) => ClientTask;
  updateTask: (id: string, updates: Partial<ClientTask>) => void;
  toggleTask: (id: string) => boolean;
  deleteTask: (id: string) => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionRate: number;
    urgentTasks: ClientTask[];
  };
}

const TaskContext = React.createContext<TaskContextType | undefined>(undefined);

const STORAGE_PREFIX = "focusflow_tasks_";

export function TaskProvider({
  children,
  userId,
  initialTasks = [],
}: {
  children: React.ReactNode;
  userId: string;
  initialTasks?: ClientTask[];
}) {
  const [tasks, setTasks] = React.useState<ClientTask[]>(initialTasks);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const storageKey = `${STORAGE_PREFIX}${userId || "guest"}`;

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
          setIsLoaded(true);
          return;
        }
      }
      if (initialTasks && initialTasks.length > 0) {
        setTasks(initialTasks);
        localStorage.setItem(storageKey, JSON.stringify(initialTasks));
      }
    } catch (e) {
      console.error("Failed to load tasks from localStorage:", e);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage whenever tasks change
  const persistTasks = React.useCallback(
    (newTasks: ClientTask[]) => {
      setTasks(newTasks);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newTasks));
      } catch (e) {
        console.error("Failed to save tasks to localStorage:", e);
      }
    },
    [storageKey]
  );

  const createTask = React.useCallback(
    (data: {
      title: string;
      description?: string | null;
      deadline: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    }) => {
      const newTask: ClientTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        description: data.description || null,
        deadline: new Date(data.deadline).toISOString(),
        priority: data.priority,
        status: data.status || "PENDING",
        completedAt: data.status === "COMPLETED" ? new Date().toISOString() : null,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTasks((prev) => {
        const updated = [newTask, ...prev];
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      return newTask;
    },
    [userId, storageKey]
  );

  const updateTask = React.useCallback(
    (id: string, updates: Partial<ClientTask>) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === id) {
            const nextStatus = updates.status || t.status;
            return {
              ...t,
              ...updates,
              completedAt:
                nextStatus === "COMPLETED"
                  ? t.completedAt || new Date().toISOString()
                  : null,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    },
    [storageKey]
  );

  const toggleTask = React.useCallback(
    (id: string) => {
      let isCompleted = false;
      setTasks((prev) => {
        const updated: ClientTask[] = prev.map((t) => {
          if (t.id === id) {
            const nextStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" =
              t.status === "COMPLETED" ? "PENDING" : "COMPLETED";
            isCompleted = nextStatus === "COMPLETED";
            return {
              ...t,
              status: nextStatus,
              completedAt: isCompleted ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      return isCompleted;
    },
    [storageKey]
  );

  const deleteTask = React.useCallback(
    (id: string) => {
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    },
    [storageKey]
  );

  // Compute stats in 0 milliseconds
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const urgentTasks = [...tasks]
      .filter((t) => t.status !== "COMPLETED")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate,
      urgentTasks,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading: !isLoaded,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = React.useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
