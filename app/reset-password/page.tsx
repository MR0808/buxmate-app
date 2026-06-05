import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Reset password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;
  const hasError = params.error === "INVALID_TOKEN" || !token;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-heading text-2xl font-semibold">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a new password for your Buxmate account
          </p>
        </div>

        <div className="buxmate-card p-6 sm:p-8">
          {hasError ? (
            <div className="space-y-4 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                This reset link is invalid or has expired. Request a new one from
                the forgot password page.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Request new reset link
              </Link>
            </div>
          ) : (
            <ResetPasswordForm token={token} />
          )}
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
