import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/actions/user";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/routing";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const dbUser = await getCurrentUser();
  const user = {
    name: dbUser?.name || session.user.name || "Foydalanuvchi",
    email: dbUser?.email || session.user.email || "",
    image: dbUser?.image || session.user.image || null,
  };

  return (
    <div className="flex min-h-screen bg-muted/20 w-full overflow-x-hidden">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
