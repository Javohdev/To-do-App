import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const segments = pathname.split("/").filter(Boolean);
      const pathWithoutLocale = ["uz", "ru", "en"].includes(segments[0])
        ? `/${segments.slice(1).join("/")}`
        : pathname;

      const isProtected =
        pathWithoutLocale.startsWith("/dashboard") ||
        pathWithoutLocale.startsWith("/tasks");

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirects to signIn page
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Added in auth.ts with Prisma & bcrypt
} satisfies NextAuthConfig;
