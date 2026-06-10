import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
  guestFooterNote,
} from "@/emails/components/email-layout";

type PaymentItemSummary = {
  title: string;
  amountOwing: string;
};

type PaymentReminderEmailProps = {
  guestName: string;
  eventName: string;
  totalOutstanding: string;
  items: PaymentItemSummary[];
  eventUrl: string;
};

export function PaymentReminderEmail({
  guestName,
  eventName,
  totalOutstanding,
  items,
  eventUrl,
}: PaymentReminderEmailProps) {
  const firstName = guestName.split(" ")[0] || guestName;

  return (
    <EmailLayout
      preview={`Payment reminder for ${eventName}`}
      title={`Payment reminder — ${eventName}`}
      footerNote={guestFooterNote}
    >
      <Text style={emailText}>Hi {firstName},</Text>
      <Text style={emailText}>
        You still have an amount marked as owing for{" "}
        <strong>{eventName}</strong>.
      </Text>
      <Text
        style={{
          ...emailText,
          fontSize: "18px",
          fontWeight: "600",
          color: "#b45309",
        }}
      >
        Total outstanding: {totalOutstanding}
      </Text>
      {items.length > 0 ? (
        <>
          <Text style={{ ...emailText, marginBottom: "8px" }}>Breakdown:</Text>
          {items.map((item) => (
            <Text
              key={item.title}
              style={{
                ...emailMuted,
                margin: "0 0 8px",
                paddingLeft: "4px",
              }}
            >
              · {item.title} — {item.amountOwing} owing
            </Text>
          ))}
        </>
      ) : null}
      <Text style={emailText}>
        Open your event page for payment instructions from the organiser. Buxmate
        does not process payments — this is a friendly reminder only.
      </Text>
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={eventUrl} style={emailButton}>
          Open event
        </Button>
      </Section>
      <Text style={emailMuted}>
        If you&apos;ve already paid, let the organiser know so they can update
        your balance.
      </Text>
    </EmailLayout>
  );
}

export default PaymentReminderEmail;
