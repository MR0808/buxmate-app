import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
} from "@/emails/components/email-layout";

type PasswordResetEmailProps = {
  name: string;
  resetUrl: string;
};

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  const firstName = name.split(" ")[0] || name;

  return (
    <EmailLayout
      preview="Reset your Buxmate password."
      title="Reset your password"
    >
      <Text style={emailText}>Hi {firstName},</Text>
      <Text style={emailText}>
        We received a request to reset your Buxmate password. Use the button
        below to choose a new one.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={resetUrl} style={emailButton}>
          Reset password
        </Button>
      </Section>
      <Text style={emailMuted}>
        This link expires in one hour. If you didn&apos;t request a password
        reset, you can safely ignore this email — your password won&apos;t
        change.
      </Text>
      <Text style={emailMuted}>
        Button not working? Copy and paste this link into your browser:
        <br />
        <span style={{ color: "#e07a3a", wordBreak: "break-all" as const }}>
          {resetUrl}
        </span>
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
