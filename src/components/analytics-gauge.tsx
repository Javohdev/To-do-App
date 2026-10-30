"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface AnalyticsGaugeProps {
  percentage: number;
  completed: number;
  total: number;
  title?: string;
  subtitle?: string;
}

export function AnalyticsGauge({
  percentage,
  completed,
  total,
  title,
  subtitle,
}: AnalyticsGaugeProps) {
  const tDash = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const safePercentage = Math.min(100, Math.max(0, percentage || 0));
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  const displayTitle = title || tDash("completionRate");
  const displaySubtitle = subtitle || tDash("productivityScore");

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-border/60 shadow-sm relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm tracking-tight">{displayTitle}</h3>
          <p className="text-xs text-muted-foreground">{displaySubtitle}</p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          <span>
            {total === 0
              ? tDash("allCaughtUp")
              : safePercentage >= 80
              ? "Zo'r natija"
              : safePercentage >= 50
              ? "Yaxshi temp"
              : "Harakatdamiz"}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-2">
        <svg
          className="w-48 h-48 transform -rotate-90"
          viewBox="0 0 180 180"
        >
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
            fill="transparent"
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Animated progress circle */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {safePercentage}%
          </motion.span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
            {completed} / {total}
          </span>
        </div>
      </div>

      {/* Mini indicator badges */}
      <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-4 border-t border-border/40">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-wider">{tDash("completedTasks")}</p>
            <p className="text-sm font-semibold">{completed}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Clock className="w-4 h-4 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-wider">{tDash("pendingTasks")}</p>
            <p className="text-sm font-semibold">{Math.max(0, total - completed)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
