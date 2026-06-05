import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import {
  sendOrganiserPasswordResetEmail,
  sendOrganiserVerificationEmail,
} from "@/lib/email/auth-emails";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? appUrl,
  trustedOrigins: [appUrl, process.env.BETTER_AUTH_URL].filter(
    (origin): origin is string => Boolean(origin),
  ),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      void sendOrganiserVerificationEmail({ user, token });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendOrganiserPasswordResetEmail({ user, url });
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
