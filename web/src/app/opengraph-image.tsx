import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #190922 0%, #8200db 55%, #ee5968 100%)",
          color: "#f8f7f2",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            opacity: 0.7,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#f8f7f2",
              alignItems: "center",
              justifyContent: "center",
              color: "#1d1d1c",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            M
          </div>
          MyTask
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.25,
            padding: "0 90px",
            letterSpacing: -1,
          }}
        >
          A task API, and a front end worth showing it in.
        </div>
      </div>
    ),
    { ...size },
  );
}
