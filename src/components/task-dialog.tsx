"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask as serverCreateTask, updateTask as serverUpdateTask } from "@/actions/tasks";
import { useTranslations } from "next-intl";
import { useTasks, ClientTask } from "@/context/task-context";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: ClientTask | null;
}

export function TaskDialog({
  open,
  onOpenChange,
  taskToEdit,
}: TaskDialogProps) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const { createTask, updateTask } = useTasks();
  const [loading, setLoading] = React.useState(false);

  const defaultDeadline = React.useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    return d.toISOString().slice(0, 16);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: defaultDeadline,
      priority: "MEDIUM",
      status: "PENDING",
    },
  });

  React.useEffect(() => {
    if (taskToEdit) {
      const dt = new Date(taskToEdit.deadline);
      const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        deadline: localIso,
        priority: taskToEdit.priority,
        status: taskToEdit.status,
      });
    } else {
      reset({
        title: "",
        description: "",
        deadline: defaultDeadline,
        priority: "MEDIUM",
        status: "PENDING",
      });
    }
  }, [taskToEdit, reset, defaultDeadline, open]);

  const priorityValue = watch("priority");
  const statusValue = watch("status");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      if (taskToEdit) {
        // 1. Instant local update (0 ms lag!)
        updateTask(taskToEdit.id, data);
        onOpenChange(false);
        reset();
        // 2. Sync to server in background
        serverUpdateTask(taskToEdit.id, data).catch(() => {});
      } else {
        // 1. Instant local creation (0 ms lag!)
        createTask(data);
        onOpenChange(false);
        reset();
        // 2. Sync to server in background
        serverCreateTask(data).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {taskToEdit ? t("editTaskTitle") : t("createTaskTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs sm:text-sm">{t("titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
              autoFocus
              className="text-sm h-10"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs sm:text-sm">{t("descLabel")}</Label>
            <Textarea
              id="description"
              placeholder={t("descPlaceholder")}
              rows={3}
              {...register("description")}
              className="text-sm"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <Label htmlFor="deadline" className="text-xs sm:text-sm">{t("deadlineLabel")}</Label>
            <Input
              id="deadline"
              type="datetime-local"
              {...register("deadline")}
              className="text-sm h-10"
            />
            {errors.deadline && (
              <p className="text-xs text-destructive">
                {errors.deadline.message}
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs sm:text-sm">{t("priorityLabel")}</Label>
              <Select
                value={priorityValue}
                onValueChange={(val: any) => setValue("priority", val)}
              >
                <SelectTrigger className="h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{t("low")}</SelectItem>
                  <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
                  <SelectItem value="HIGH">{t("high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs sm:text-sm">{t("statusLabel")}</Label>
              <Select
                value={statusValue}
                onValueChange={(val: any) => setValue("status", val)}
              >
                <SelectTrigger className="h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">{t("pending")}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t("inProgress")}</SelectItem>
                  <SelectItem value="COMPLETED">{t("completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs sm:text-sm h-9"
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold text-xs sm:text-sm h-9">
              {loading
                ? tCommon("loading")
                : taskToEdit
                ? tCommon("save")
                : tCommon("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
