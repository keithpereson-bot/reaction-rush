import { ImageResponse } from "next/og";
import { SITE } from "@/config/game";

export const runtime = "edge";
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#08090c",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontFamily: "sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              backgroundColor: "#a3ff12",
              display: "flex",
            }}
          />
          <div style={{ marginTop: 36, fontSize: 76, fontWeight: 800, display: "flex" }}>
            {SITE.name}
          </div>
          <div style={{ marginTop: 16, fontSize: 32, color: "rgba(255,255,255,0.6)", display: "flex" }}>
            {SITE.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
