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
import { createTask, updateTask } from "@/actions/tasks";
import { useTranslations } from "next-intl";
import { TaskItem } from "./task-card";

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
  taskToEdit?: TaskItem | null;
  onSuccess?: () => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  taskToEdit,
  onSuccess,
}: TaskDialogProps) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = React.useState(false);

  const defaultDeadline = React.useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    // Format to YYYY-MM-DDTHH:mm
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
      // adjust to local timezone string YYYY-MM-DDTHH:mm
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
        await updateTask(taskToEdit.id, data);
      } else {
        await createTask(data);
      }
      onOpenChange(false);
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? t("editTaskTitle") : t("createTaskTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">{t("descLabel")}</Label>
            <Textarea
              id="description"
              placeholder={t("descPlaceholder")}
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline">{t("deadlineLabel")}</Label>
            <Input
              id="deadline"
              type="datetime-local"
              {...register("deadline")}
            />
            {errors.deadline && (
              <p className="text-xs text-destructive">
                {errors.deadline.message}
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("priorityLabel")}</Label>
              <Select
                value={priorityValue}
                onValueChange={(val: any) => setValue("priority", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{t("low")}</SelectItem>
                  <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
                  <SelectItem value="HIGH">{t("high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("statusLabel")}</Label>
              <Select
                value={statusValue}
                onValueChange={(val: any) => setValue("status", val)}
              >
                <SelectTrigger>
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

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold">
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
