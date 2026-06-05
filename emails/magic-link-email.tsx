import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
} from "@/emails/components/email-layout";

type MagicLinkEmailProps = {
  signInUrl: string;
};

export function MagicLinkEmail({ signInUrl }: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Your secure Buxmate sign-in link."
      title="Sign in to Buxmate"
    >
      <Text style={emailText}>
        Tap the button below to sign in to your Buxmate organiser account. This
        link is single-use and expires shortly.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={signInUrl} style={emailButton}>
          Sign in to Buxmate
        </Button>
      </Section>
      <Text style={emailMuted}>
        If you didn&apos;t request this link, you can safely ignore this email.
      </Text>
      <Text style={emailMuted}>
        Button not working? Copy and paste this link into your browser:
        <br />
        <span style={{ color: "#e07a3a", wordBreak: "break-all" as const }}>
          {signInUrl}
        </span>
      </Text>
    </EmailLayout>
  );
}

export default MagicLinkEmail;
