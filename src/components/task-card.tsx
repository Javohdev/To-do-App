"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRemainingTime } from "@/lib/utils";
import { Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import { toggleTaskStatus, deleteTask } from "@/actions/tasks";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date | string;
  createdAt: Date | string;
}

interface TaskCardProps {
  task: TaskItem;
  onEdit?: (task: TaskItem) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onDelete?: (id: string) => void;
}

const priorityBadges = {
  LOW: { labelKey: "low", variant: "info" as const },
  MEDIUM: { labelKey: "medium", variant: "warning" as const },
  HIGH: { labelKey: "high", variant: "destructive" as const },
};

export function TaskCard({
  task,
  onEdit,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const t = useTranslations("tasks");
  const tDash = useTranslations("dashboard");
  const [isCompleted, setIsCompleted] = React.useState(
    task.status === "COMPLETED"
  );
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    setIsCompleted(task.status === "COMPLETED");
  }, [task.status]);

  const handleToggle = async () => {
    if (isUpdating) return;
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    if (nextState) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
        });
      } catch (e) {
        // Confetti fallback
      }
    }

    setIsUpdating(true);
    try {
      const res = await toggleTaskStatus(task.id);
      if (res.success && onStatusChange) {
        onStatusChange(task.id, nextState ? "COMPLETED" : "PENDING");
      }
    } catch (err) {
      // Revert if error
      setIsCompleted(!nextState);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t("deleteConfirmTitle"))) {
      try {
        await deleteTask(task.id);
        if (onDelete) onDelete(task.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const remaining = formatRemainingTime(task.deadline, (key, vals) =>
    tDash(key, vals)
  );

  const isOverdue =
    new Date(task.deadline).getTime() < Date.now() && !isCompleted;

  const priorityConfig = priorityBadges[task.priority] || priorityBadges.MEDIUM;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-muted/30 border-border/40 opacity-75"
          : isOverdue
          ? "bg-destructive/5 border-destructive/30 hover:border-destructive/50"
          : "bg-card border-border/70 hover:border-primary/40 shadow-sm hover:shadow"
      }`}
    >
      {/* Left side: Checkbox + Title + Description + Meta */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-4">
        <div className="pt-0.5">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggle}
            aria-label="Toggle task completion"
            className="h-5 w-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-semibold text-sm sm:text-base leading-snug transition-all ${
                isCompleted
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h4>

            <Badge variant={priorityConfig.variant} className="text-[11px] py-0 px-2 font-medium">
              {t(priorityConfig.labelKey)}
            </Badge>

            {isCompleted && (
              <Badge variant="success" className="text-[11px] py-0 px-2">
                {t("completed")}
              </Badge>
            )}
          </div>

          {task.description && (
            <p
              className={`text-xs line-clamp-2 ${
                isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>
                {new Date(task.deadline).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 font-medium ${
                isOverdue
                  ? "text-destructive font-semibold"
                  : isCompleted
                  ? "text-muted-foreground"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{remaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-1 mt-3 sm:mt-0 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(task)}
            title={t("editTaskTitle")}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title={t("deleteConfirmTitle")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
