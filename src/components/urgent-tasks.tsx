"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatRemainingTime } from "@/lib/utils";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, ClientTask } from "@/context/task-context";
import { toggleTaskStatus } from "@/actions/tasks";

interface UrgentTasksProps {
  tasks: ClientTask[];
}

export function UrgentTasks({ tasks: fallbackTasks }: UrgentTasksProps) {
  const t = useTranslations("dashboard");
  const tTasks = useTranslations("tasks");
  const { stats, toggleTask } = useTasks();

  const urgentList = stats.urgentTasks;

  const handleToggle = (taskId: string) => {
    // Confetti animation
    try {
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#10b981", "#f59e0b"],
      });
    } catch (e) {}

    // Instant zero-latency update
    toggleTask(taskId);

    // Sync with server in background
    toggleTaskStatus(taskId, "COMPLETED").catch(() => {});
  };

  if (!urgentList || urgentList.length === 0) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 flex flex-col items-center justify-center text-center space-y-2.5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h4 className="font-semibold text-foreground text-xs sm:text-sm">
          {t("noUrgentTasks")}
        </h4>
        <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xs">
          {t("allCaughtUp")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-xs sm:text-sm tracking-tight">
              {t("urgentTasks")}
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {t("urgentTasksDesc")}
            </p>
          </div>
        </div>
        <Badge variant="warning" className="text-[11px] font-medium px-2 py-0.5">
          {urgentList.length} ta
        </Badge>
      </div>

      <div className="space-y-2 pt-1">
        <AnimatePresence>
          {urgentList.map((task) => {
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
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isOverdue
                    ? "bg-destructive/5 border-destructive/30"
                    : "bg-background/60 hover:bg-accent/40 border-border/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleToggle(task.id)}
                    className="h-4 w-4 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    title={t("markCompleted")}
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Badge
                    variant={
                      task.priority === "HIGH"
                        ? "destructive"
                        : task.priority === "MEDIUM"
                        ? "warning"
                        : "info"
                    }
                    className="text-[9px] sm:text-[10px] px-1.5 py-0"
                  >
                    {tTasks(task.priority.toLowerCase())}
                  </Badge>

                  <div
                    className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold ${
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
