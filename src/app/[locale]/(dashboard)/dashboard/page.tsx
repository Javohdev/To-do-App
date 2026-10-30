"use client";

import * as React from "react";
import { useTasks } from "@/context/task-context";
import { KpiCard } from "@/components/kpi-card";
import { AnalyticsGauge } from "@/components/analytics-gauge";
import { UrgentTasks } from "@/components/urgent-tasks";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { stats } = useTasks();

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-card px-3 py-1 rounded-full border border-border/70 text-[11px] sm:text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>FocusFlow Analytics</span>
        </div>
      </div>

      {/* KPI Cards Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <KpiCard
          title={t("totalTasks")}
          value={stats.total}
          iconName="total"
          colorVariant="indigo"
        />
        <KpiCard
          title={t("completedTasks")}
          value={stats.completed}
          iconName="completed"
          colorVariant="emerald"
        />
        <KpiCard
          title={t("pendingTasks")}
          value={stats.pending}
          iconName="pending"
          colorVariant="amber"
        />
        <KpiCard
          title={t("completionRate")}
          value={`${stats.completionRate}%`}
          iconName="rate"
          trend={stats.completionRate >= 50 ? "+5%" : undefined}
          trendUp={stats.completionRate >= 50}
          colorVariant="violet"
        />
      </div>

      {/* Main Grid: Visual Progress Gauge + Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Visual Progress Gauge */}
        <div className="lg:col-span-1">
          <AnalyticsGauge
            percentage={stats.completionRate}
            completed={stats.completed}
            total={stats.total}
            title={t("completionRate")}
            subtitle={t("productivityScore")}
          />
        </div>

        {/* Right Column: Urgent Tasks */}
        <div className="lg:col-span-2">
          <UrgentTasks tasks={stats.urgentTasks as any} />
        </div>
      </div>
    </div>
  );
}
