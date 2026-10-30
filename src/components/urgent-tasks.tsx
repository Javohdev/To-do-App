"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatRemainingTime } from "@/lib/utils";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toggleTaskStatus } from "@/actions/tasks";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";

interface UrgentTask {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date | string;
}

interface UrgentTasksProps {
  tasks: UrgentTask[];
}

export function UrgentTasks({ tasks: initialTasks }: UrgentTasksProps) {
  const t = useTranslations("dashboard");
  const tTasks = useTranslations("tasks");
  const router = useRouter();
  const [tasks, setTasks] = React.useState(initialTasks);

  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleToggle = async (taskId: string) => {
    // Confetti animation
    try {
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#10b981", "#f59e0b"],
      });
    } catch (e) {}

    // Optimistically remove from urgent list
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await toggleTaskStatus(taskId, "COMPLETED");
      router.refresh();
    } catch (err) {
      console.error(err);
      setTasks(initialTasks);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-border/70 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-foreground text-sm">
          {t("noUrgentTasks")}
        </h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          {t("allCaughtUp")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm tracking-tight">
              {t("urgentTasks")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("urgentTasksDesc")}
            </p>
          </div>
        </div>
        <Badge variant="warning" className="text-xs font-medium">
          {tasks.length} ta
        </Badge>
      </div>

      <div className="space-y-2.5 pt-1">
        <AnimatePresence>
          {tasks.map((task) => {
            const isOverdue =
              new Date(task.deadline).getTime() < Date.now();
            const remaining = formatRemainingTime(task.deadline, (key, val) =>
              t(key, val)
            );

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isOverdue
                    ? "bg-destructive/5 border-destructive/30"
                    : "bg-background/60 hover:bg-accent/40 border-border/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleToggle(task.id)}
                    className="h-4 w-4 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    title={t("markCompleted")}
                  />
                  <span className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      task.priority === "HIGH"
                        ? "destructive"
                        : task.priority === "MEDIUM"
                        ? "warning"
                        : "info"
                    }
                    className="text-[10px] px-2 py-0"
                  >
                    {tTasks(task.priority.toLowerCase())}
                  </Badge>

                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      isOverdue
                        ? "text-destructive"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{remaining}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
