import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
} from "@/emails/components/email-layout";

type VerifyEmailProps = {
  name: string;
  verifyUrl: string;
};

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  const firstName = name.split(" ")[0] || name;

  return (
    <EmailLayout
      preview="Verify your Buxmate account to start planning private events."
      title="Verify your email"
    >
      <Text style={emailText}>Hi {firstName},</Text>
      <Text style={emailText}>
        Thanks for signing up to Buxmate. Tap the button below to verify your
        email and activate your organiser account.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={verifyUrl} style={emailButton}>
          Verify my email
        </Button>
      </Section>
      <Text style={emailMuted}>
        This link expires in 24 hours. If you didn&apos;t create a Buxmate
        account, you can safely ignore this email.
      </Text>
      <Text style={emailMuted}>
        Button not working? Copy and paste this link into your browser:
        <br />
        <span style={{ color: "#e07a3a", wordBreak: "break-all" as const }}>
          {verifyUrl}
        </span>
      </Text>
    </EmailLayout>
  );
}

export default VerifyEmail;
