"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ListTodo, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName?: "total" | "completed" | "pending" | "rate";
  trend?: string;
  trendUp?: boolean;
  colorVariant?: "indigo" | "emerald" | "amber" | "violet";
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    glow: "group-hover:shadow-indigo-500/10",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    glow: "group-hover:shadow-amber-500/10",
  },
  violet: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    glow: "group-hover:shadow-purple-500/10",
  },
};

export function KpiCard({
  title,
  value,
  description,
  iconName = "total",
  trend,
  trendUp,
  colorVariant = "indigo",
}: KpiCardProps) {
  const colors = colorMap[colorVariant];

  const renderIcon = () => {
    switch (iconName) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "pending":
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "rate":
        return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "total":
      default:
        return <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "group relative p-3.5 sm:p-5 rounded-2xl bg-card border border-border/70 shadow-sm transition-all duration-300 overflow-hidden",
        colors.glow
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-semibold px-1.5 py-0.2 rounded-full",
                  trendUp
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                {trend}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-muted-foreground pt-0.5 line-clamp-1">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "p-2 sm:p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
            colors.bg,
            colors.text,
            colors.border
          )}
        >
          {renderIcon()}
        </div>
      </div>
    </motion.div>
  );
}
