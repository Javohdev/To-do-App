import * as React from "react";
import { getDashboardData } from "@/actions/tasks";
import { KpiCard } from "@/components/kpi-card";
import { AnalyticsGauge } from "@/components/analytics-gauge";
import { UrgentTasks } from "@/components/urgent-tasks";
import { getTranslations } from "next-intl/server";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-card px-3.5 py-1.5 rounded-full border border-border/70 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>FocusFlow Analytics</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t("totalTasks")}
          value={data.total}
          icon={ListTodo}
          colorVariant="indigo"
        />
        <KpiCard
          title={t("completedTasks")}
          value={data.completed}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <KpiCard
          title={t("pendingTasks")}
          value={data.pending}
          icon={Clock}
          colorVariant="amber"
        />
        <KpiCard
          title={t("completionRate")}
          value={`${data.completionRate}%`}
          icon={TrendingUp}
          trend={data.completionRate >= 50 ? "+5% bu hafta" : "Past"}
          trendUp={data.completionRate >= 50}
          colorVariant="violet"
        />
      </div>

      {/* Main Grid: Visual Progress Gauge + Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Progress Gauge */}
        <div className="lg:col-span-1">
          <AnalyticsGauge
            percentage={data.completionRate}
            completed={data.completed}
            total={data.total}
            title={t("completionRate")}
            subtitle={t("productivityScore")}
          />
        </div>

        {/* Right Column: Urgent Tasks */}
        <div className="lg:col-span-2">
          <UrgentTasks tasks={data.urgentTasks as any} />
        </div>
      </div>
    </div>
  );
}
