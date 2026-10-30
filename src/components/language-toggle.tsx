"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: string) => {
    // Set cookie for next-intl so server immediately recognizes language preference
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(() => {
      // Replaces current route with new locale prefix seamlessly
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  };

  return (
    <Select
      value={locale}
      onValueChange={handleLanguageChange}
      disabled={isPending}
    >
      <SelectTrigger className="h-9 w-[130px] rounded-lg text-xs font-medium border-border/60 bg-background/50 hover:bg-accent transition-all">
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Til" />
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-xs">
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
