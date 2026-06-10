import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
  guestFooterNote,
} from "@/emails/components/email-layout";

type GuestInviteEmailProps = {
  guestName: string;
  eventName: string;
  eventDate: string;
  organiserName: string;
  inviteUrl: string;
};

export function GuestInviteEmail({
  guestName,
  eventName,
  eventDate,
  organiserName,
  inviteUrl,
}: GuestInviteEmailProps) {
  const firstName = guestName.split(" ")[0] || guestName;

  return (
    <EmailLayout
      preview={`${organiserName} invited you to ${eventName}`}
      title="You're invited"
      footerNote={guestFooterNote}
    >
      <Text style={emailText}>Hi {firstName},</Text>
      <Text style={emailText}>
        <strong>{organiserName}</strong> invited you to{" "}
        <strong>{eventName}</strong>
        {eventDate !== "Dates not set" ? ` on ${eventDate}` : ""}.
      </Text>
      <Text style={emailText}>
        This is a private event on Buxmate. Use your personal link below to view
        details, RSVP to activities, and see what you owe.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={inviteUrl} style={emailButton}>
          View event invite
        </Button>
      </Section>
      <Text style={emailMuted}>
        This link is just for you. Please don&apos;t forward it — ask the
        organiser if you need a new one.
      </Text>
    </EmailLayout>
  );
}

export default GuestInviteEmail;
