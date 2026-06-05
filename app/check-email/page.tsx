import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckEmailCard } from "@/components/auth/check-email-card";
import { Logo } from "@/components/shared/logo";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Check your email",
};

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const params = await searchParams;
  const session = await getSession();

  if (session?.user.emailVerified) {
    redirect("/");
  }

  const email = params.email ?? session?.user.email;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
        </div>

        <CheckEmailCard email={email} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
