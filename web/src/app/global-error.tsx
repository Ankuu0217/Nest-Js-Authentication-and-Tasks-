"use client";

/**
 * Replaces the entire root layout when a root-segment error occurs, so it
 * can't rely on globals.css having loaded — inline styles only, hand-matched
 * to the token values rather than imported from them.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#f8f7f2",
          color: "#1d1d1c",
          fontFamily:
            "'Nunito Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 400, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: "12px", color: "#7a7974", maxWidth: "28rem" }}>
            The app hit an error it couldn&apos;t recover from. Reloading usually fixes it.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              color: "#1d1d1c",
              padding: "10px 20px",
              border: "1px solid #d8d6ce",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
