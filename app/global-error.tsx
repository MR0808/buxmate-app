"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fffaf5",
          color: "#1c1917",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              textAlign: "center",
              border: "1px solid #e7e5e4",
              borderRadius: "1rem",
              padding: "2rem",
              background: "#ffffff",
            }}
          >
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#78716c", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Buxmate hit an unexpected error. Please refresh and try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#e07a3a",
                color: "#fffaf5",
                border: "none",
                borderRadius: "9999px",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
