import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { mockUsers } from "@/lib/demo-store";

const hasExternalDb =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("localhost:5432");

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  ...(hasExternalDb ? { adapter: PrismaAdapter(prisma) } : {}),
  session: {
    strategy: "jwt",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // 1. Direct Demo Quick Access
        if (
          (email === "demo@focusflow.uz" && password === "demo12345") ||
          (email === "demo" && password === "demo")
        ) {
          return {
            id: "demo-user-id",
            name: "Ali Valiyev (Demo)",
            email: "demo@focusflow.uz",
            image: null,
          };
        }

        // 2. Check local mock store (immediate, no DB timeout!)
        const mockFound = mockUsers.find((u) => u.email === email);
        if (mockFound) {
          if (!mockFound.passwordHash) {
            return {
              id: mockFound.id,
              name: mockFound.name,
              email: mockFound.email,
              image: mockFound.image || null,
            };
          }

          const isMatch = await bcrypt.compare(password, mockFound.passwordHash);
          if (isMatch) {
            return {
              id: mockFound.id,
              name: mockFound.name,
              email: mockFound.email,
              image: mockFound.image || null,
            };
          }
        }

        // 3. Check PostgreSQL database if external DB is configured
        if (hasExternalDb) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user || !user.password) {
              return null;
            }

            const isPasswordMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (!isPasswordMatch) {
              return null;
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } catch (error) {
            console.warn("External DB query error in authorize:", error);
            return null;
          }
        }

        // Fallback for testing: allow any valid login if user was entered
        return {
          id: `user-${Date.now()}`,
          name: email.split("@")[0],
          email,
          image: null,
        };
      },
    }),
  ],
});
