import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButton,
  emailMuted,
  emailText,
  guestFooterNote,
} from "@/emails/components/email-layout";

type ActivityNeedingRsvp = {
  title: string;
  when: string;
};

type RsvpReminderEmailProps = {
  guestName: string;
  eventName: string;
  activities: ActivityNeedingRsvp[];
  eventUrl: string;
};

export function RsvpReminderEmail({
  guestName,
  eventName,
  activities,
  eventUrl,
}: RsvpReminderEmailProps) {
  const firstName = guestName.split(" ")[0] || guestName;

  return (
    <EmailLayout
      preview={`RSVP reminder for ${eventName}`}
      title={`RSVP reminder — ${eventName}`}
      footerNote={guestFooterNote}
    >
      <Text style={emailText}>Hi {firstName},</Text>
      <Text style={emailText}>
        The organiser is waiting on your RSVP for{" "}
        <strong>{eventName}</strong>.
      </Text>
      {activities.length > 0 ? (
        <>
          <Text style={{ ...emailText, marginBottom: "8px" }}>
            Activities needing your response:
          </Text>
          {activities.map((activity) => (
            <Text
              key={`${activity.title}-${activity.when}`}
              style={{
                ...emailMuted,
                margin: "0 0 10px",
                paddingLeft: "4px",
              }}
            >
              · <strong>{activity.title}</strong>
              {activity.when ? ` — ${activity.when}` : ""}
            </Text>
          ))}
        </>
      ) : (
        <Text style={emailText}>
          Please open your event page and let the organiser know what you can
          make.
        </Text>
      )}
      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Button href={eventUrl} style={emailButton}>
          RSVP now
        </Button>
      </Section>
      <Text style={emailMuted}>
        It only takes a moment — your organiser is planning around your
        response.
      </Text>
    </EmailLayout>
  );
}

export default RsvpReminderEmail;
