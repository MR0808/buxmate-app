import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

type EmailLayoutProps = {
  preview: string;
  title: string;
  children: ReactNode;
  footerNote?: string;
};

const defaultFooterNote =
  "You received this email because of activity on your Buxmate organiser account.";

const guestFooterNote =
  "You received this email because you were invited to a private Buxmate event. This link is for you only — please do not share it.";

export function EmailLayout({
  preview,
  title,
  children,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoMark}>B</Text>
            <Heading style={brandName}>Buxmate</Heading>
          </Section>

          <Section style={card}>
            <Heading style={titleStyle}>{title}</Heading>
            {children}
          </Section>

          <Hr style={hr} />
          <Text style={tagline}>
            Plan the chaos. Split the cost. Keep it private.
          </Text>
          <Text style={footer}>{footerNote ?? defaultFooterNote}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#faf8f5",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "32px 16px",
};

const container = {
  margin: "0 auto",
  maxWidth: "520px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoMark = {
  display: "inline-block",
  width: "40px",
  height: "40px",
  lineHeight: "40px",
  borderRadius: "12px",
  backgroundColor: "#e07a3a",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 auto 8px",
};

const brandName = {
  color: "#2c3345",
  fontSize: "22px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "-0.02em",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "32px 28px",
  border: "1px solid #ebe6df",
};

const titleStyle = {
  color: "#2c3345",
  fontSize: "22px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#ebe6df",
  margin: "28px 0 16px",
};

const tagline = {
  color: "#e07a3a",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  textAlign: "center" as const,
  margin: "0",
};

export const emailText = {
  color: "#3d4556",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

export const emailMuted = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

export { guestFooterNote };

export const emailButton = {
  backgroundColor: "#e07a3a",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1",
  padding: "14px 28px",
  textDecoration: "none",
  textAlign: "center" as const,
};
