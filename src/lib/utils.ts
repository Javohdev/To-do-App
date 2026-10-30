import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRemainingTime(deadline: Date | string, t: (key: string, values?: any) => string) {
  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return t("overdue");
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 1) {
    return t("daysLeft", { count: diffDays });
  } else if (diffDays === 1) {
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    return `${t("tomorrow")} ${hours}:${minutes}`;
  } else if (diffHours > 0) {
    return t("hoursLeft", { count: diffHours });
  } else {
    return t("minutesLeft", { count: Math.max(1, diffMinutes) });
  }
}
