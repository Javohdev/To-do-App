"use client";

import * as React from "react";
import { TaskCard, TaskItem } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, CheckCircle2, ListTodo } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

interface TaskListProps {
  initialTasks: TaskItem[];
}

export function TaskList({ initialTasks }: TaskListProps) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);

  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Search by title
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "PENDING") {
        matchesStatus = task.status === "PENDING";
      } else if (statusFilter === "IN_PROGRESS") {
        matchesStatus = task.status === "IN_PROGRESS";
      } else if (statusFilter === "COMPLETED") {
        matchesStatus = task.status === "COMPLETED";
      }

      // Priority filter
      let matchesPriority = true;
      if (priorityFilter !== "ALL") {
        matchesPriority = task.priority === priorityFilter;
      }

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t))
    );
    router.refresh();
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar: Search & Filters & Add button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10 h-10 rounded-xl bg-card border-border/80"
          />
        </div>

        {/* Filter dropdowns and Add button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl bg-card border-border/80 text-xs font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ALL">{t("allStatus")}</SelectItem>
              <SelectItem value="PENDING">{t("pending")}</SelectItem>
              <SelectItem value="IN_PROGRESS">{t("inProgress")}</SelectItem>
              <SelectItem value="COMPLETED">{t("completed")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl bg-card border-border/80 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ALL">{t("allPriorities")}</SelectItem>
              <SelectItem value="HIGH">{t("high")}</SelectItem>
              <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
              <SelectItem value="LOW">{t("low")}</SelectItem>
            </SelectContent>
          </Select>

          {/* New Task Button */}
          <Button
            onClick={handleAddNew}
            className="h-10 rounded-xl px-4 font-semibold shadow-sm gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addTask")}</span>
          </Button>
        </div>
      </div>

      {/* Task List items */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border/60 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ListTodo className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-base">
              {t("noTasksFound")}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {t("noTasksDesc")}
            </p>
            <Button
              onClick={handleAddNew}
              variant="outline"
              size="sm"
              className="mt-2 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("addTask")}
            </Button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        taskToEdit={editingTask}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
