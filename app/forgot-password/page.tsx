import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-heading text-2xl font-semibold">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a secure reset link
          </p>
        </div>

        <div className="buxmate-card p-6 sm:p-8">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
