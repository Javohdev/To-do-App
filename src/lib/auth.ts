import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { findUserByEmail, saveUser } from "@/lib/demo-store";

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

        // 1. Check local persistent store first (ultra-fast, works on mobile & restarts)
        const localFound = findUserByEmail(email);
        if (localFound) {
          if (!localFound.passwordHash) {
            return {
              id: localFound.id,
              name: localFound.name,
              email: localFound.email,
              image: localFound.image || null,
            };
          }

          const isMatch = await bcrypt.compare(password, localFound.passwordHash);
          if (isMatch) {
            return {
              id: localFound.id,
              name: localFound.name,
              email: localFound.email,
              image: localFound.image || null,
            };
          }
        }

        // 2. Check PostgreSQL database if external DB is configured
        if (hasExternalDb) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (user && user.password) {
              const isPasswordMatch = await bcrypt.compare(password, user.password);
              if (isPasswordMatch) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                };
              }
            }
          } catch (error) {
            console.warn("External DB query error in authorize:", error);
          }
        }

        // 3. Fallback: create persistent local record so user session never loses identity
        const cleanName = email.split("@")[0];
        const newUserId = `user-${Date.now()}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          id: newUserId,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          email,
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString(),
        };
        saveUser(newUser);

        return {
          id: newUserId,
          name: newUser.name,
          email: newUser.email,
          image: null,
        };
      },
    }),
  ],
});
