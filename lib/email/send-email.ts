import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { getEmailFrom, getResendClient } from "@/lib/email/resend";

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailInput) {
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
    throw new Error(error.message);
  }
}
