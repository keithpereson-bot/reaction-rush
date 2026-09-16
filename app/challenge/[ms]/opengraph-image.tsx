import { ImageResponse } from "next/og";
import { SITE, getScoreLabel } from "@/config/game";

export const runtime = "edge";
export const alt = "Reaction Rush challenge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { ms: string };
}

export default async function Image({ params }: Props) {
  const ms = Number(params.ms);
  const valid = Number.isFinite(ms) && ms > 0 && ms < 5000;
  const label = valid ? getScoreLabel(ms) : null;

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
          <div style={{ fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.4)", display: "flex" }}>
            {SITE.name.toUpperCase()}
          </div>

          {valid ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 140, fontWeight: 800, display: "flex" }}>{ms}</div>
                <div style={{ fontSize: 56, color: "rgba(255,255,255,0.5)", marginLeft: 16, display: "flex" }}>
                  ms
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 40, color: "#a3ff12", fontWeight: 700, display: "flex" }}>
                {label}
              </div>
              <div style={{ marginTop: 28, fontSize: 32, color: "rgba(255,255,255,0.6)", display: "flex" }}>
                Can you beat it?
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 24, fontSize: 56, fontWeight: 800, display: "flex" }}>
              Test your reaction time
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
