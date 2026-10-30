import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2, BarChart3, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (session?.user) {
    redirect({ href: "/dashboard", locale });
  }

  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Top Navigation */}
      <header className="border-b border-border/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">FocusFlow</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs">
                {tAuth("signIn")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-semibold text-xs rounded-lg shadow-sm">
                {tAuth("signUp")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Aqlli va Zamonaviy Unumdorlik Tizimi</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
          Vazifalaringizni tartibga soling,{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-primary to-purple-500 bg-clip-text text-transparent">
            unumdorlikni
          </span>{" "}
          cho'qqiga olib chiqing.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          FocusFlow — real-vaqt rejimida vazifalar monitoringi, eng yaqin deadline eslatmalari va chuqur analitika bilan jihozlangan kuchli To-Do platformasi.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/register">
            <Button size="lg" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/25 gap-2 text-base">
              <span>Boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="rounded-xl px-8 font-semibold text-base">
              Mavjud hisobga kirish
            </Button>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 w-full text-left">
          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Aqlli Boshqaruv</h3>
            <p className="text-xs text-muted-foreground">Prioritetlar, filtrlar va darhol bajarilish qaydlari.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Vizual Analitika</h3>
            <p className="text-xs text-muted-foreground">Dumaloq gauge va KPI kartochkalar orqali aniq progress.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Ishonchli va Xavfsiz</h3>
            <p className="text-xs text-muted-foreground">PostgreSQL, NextAuth v5 va bcrypt bilan to'liq himoyalangan.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FocusFlow. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
