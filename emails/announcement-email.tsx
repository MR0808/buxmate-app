import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
  guestFooterNote,
} from "@/emails/components/email-layout";

type AnnouncementEmailProps = {
  guestName: string;
  eventName: string;
  content: string;
  eventUrl: string;
};

export function AnnouncementEmail({
  guestName,
  eventName,
  content,
  eventUrl,
}: AnnouncementEmailProps) {
  const firstName = guestName.split(" ")[0] || guestName;

  return (
    <EmailLayout
      preview={`New announcement for ${eventName}`}
      title={`Announcement — ${eventName}`}
      footerNote={guestFooterNote}
    >
      <Text style={emailText}>Hi {firstName},</Text>
      <Text style={emailText}>
        There&apos;s a new announcement for <strong>{eventName}</strong>:
      </Text>
      <Text
        style={{
          ...emailText,
          backgroundColor: "#faf8f5",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #ebe6df",
        }}
      >
        {content}
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={eventUrl} style={emailButton}>
          Open event
        </Button>
      </Section>
      <Text style={emailMuted}>
        Use your private invite link to view the full event page.
      </Text>
    </EmailLayout>
  );
}

export default AnnouncementEmail;
