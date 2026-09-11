"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { SITE } from "@/config/game";

interface ShareButtonProps {
  ms: number;
  variant?: "share" | "challenge";
}

export function ShareButton({ ms, variant = "share" }: ShareButtonProps) {
  const [copied, setCopied] = useState<null | "text" | "link">(null);

  const challengeUrl = `${SITE.url}/challenge/${ms}`;
  const message = `I scored ${ms} ms on Reaction Rush. Can you beat me?`;

  async function handleClick() {
    track("share_clicked", { ms, variant });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: SITE.name,
          text: message,
          url: challengeUrl,
        });
        return;
      } catch {
        // User cancelled or share failed silently — fall through to copy.
      }
    }

    // Fallback: copy to clipboard.
    try {
      if (variant === "challenge") {
        await navigator.clipboard.writeText(challengeUrl);
        setCopied("link");
      } else {
        await navigator.clipboard.writeText(message);
        setCopied("text");
      }
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable — nothing more we can do gracefully here.
    }
  }

  const label =
    copied === "link" ? "Link copied!" : copied === "text" ? "Copied!" : variant === "challenge" ? "Challenge a friend" : "Share result";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      {label}
    </button>
  );
}
