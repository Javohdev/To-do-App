"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  LogOut,
  Sparkles,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface UserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SidebarProps {
  user: UserProfile;
}

export function Sidebar({ user }: SidebarProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: tNav("dashboard"),
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/tasks",
      label: tNav("tasks"),
      icon: CheckSquare,
      active: pathname === "/tasks",
    },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const SidebarBody = () => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Brand & User Card */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-primary flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
              FocusFlow
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              Productivity App
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border/70 shrink-0">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-foreground">
              {user.name || "Foydalanuvchi"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email || ""}
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Language, Theme, Logout */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between gap-2 px-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>{tNav("logout")}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-card/60 backdrop-blur-xl p-5 shrink-0 min-h-screen">
        <SidebarBody />
      </aside>

      {/* Mobile Header Bar & Hamburger Sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base">FocusFlow</span>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-5">
            <SidebarBody />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
