import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { getAuthApiUrl } from "@/lib/email/app-url";

export const metadata: Metadata = {
  title: "Verify email",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
    callbackURL?: string;
    error?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;

  if (params.error) {
    return (
      <AuthShell>
        <StatusCard
          icon={XCircle}
          variant="error"
          title="Verification failed"
          description="This link may have expired or already been used. Request a new verification email from the check-email page."
          action={
            <Button className="rounded-full normal-case tracking-normal" asChild>
              <Link href="/check-email">Go to check email</Link>
            </Button>
          }
        />
      </AuthShell>
    );
  }

  if (!params.token) {
    redirect("/check-email");
  }

  const callbackURL =
    params.callbackURL ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login?verified=1`;
  const verifyUrl = `${getAuthApiUrl()}/verify-email?token=${encodeURIComponent(params.token)}&callbackURL=${encodeURIComponent(callbackURL)}`;

  redirect(verifyUrl);
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  variant,
  title,
  description,
  action,
}: {
  icon: typeof XCircle;
  variant: "success" | "error";
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="buxmate-card p-6 text-center sm:p-8">
      <div
        className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${
          variant === "success"
            ? "bg-brand-muted text-primary"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        <Icon className="size-6" aria-hidden />
      </div>
      <h1 className="mt-5 font-heading text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">{action}</div>
    </div>
  );
}
