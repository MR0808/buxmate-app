import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import {
  sendOrganiserPasswordResetEmail,
  sendOrganiserVerificationEmail,
} from "@/lib/email/auth-emails";
import { getAuthBaseUrl, getPublicAppUrl } from "@/lib/env";

const appUrl = getPublicAppUrl();
const authBaseUrl = getAuthBaseUrl();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: authBaseUrl,
  trustedOrigins: [appUrl, authBaseUrl].filter(
    (origin, index, origins) => Boolean(origin) && origins.indexOf(origin) === index,
  ),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        const { sendOrganiserChangeEmailVerification } = await import(
          "@/lib/email/auth-emails"
        );
        void sendOrganiserChangeEmailVerification({
          user,
          newEmail,
          verifyUrl: url,
        });
      },
    },
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
