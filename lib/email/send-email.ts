import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { getEmailFrom, getResendClient } from "@/lib/email/resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

export type SendEmailResult =
  | { success: true }
  | { success: false; error: string };

export type BulkEmailResult = {
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
};

export async function sendEmail({ to, subject, react }: SendEmailInput) {
  const result = await sendEmailSafe({ to, subject, react });
  if (!result.success) {
    throw new Error(result.error);
  }
}

export async function sendEmailSafe({
  to,
  subject,
  react,
}: SendEmailInput): Promise<SendEmailResult> {
  try {
    const html = await render(react);
    const text = await render(react, { plainText: true });

    const { error } = await getResendClient().emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
      text,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email.",
    };
  }
}

export async function sendEmailsBulk(
  emails: SendEmailInput[],
): Promise<BulkEmailResult> {
  const seen = new Set<string>();
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of emails) {
    const key = email.to.trim().toLowerCase();
    if (!key) {
      skipped += 1;
      continue;
    }
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);

    const result = await sendEmailSafe(email);
    if (result.success) {
      sent += 1;
    } else {
      failed += 1;
      errors.push(`${email.to}: ${result.error}`);
    }
  }

  return { sent, skipped, failed, errors };
}
