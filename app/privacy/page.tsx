import type { Metadata } from "next";
import { SITE } from "@/config/game";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Privacy</h1>
      <div className="mt-6 space-y-4 text-white/70">
        <p>
          {SITE.name} does not require an account to play. Your personal best, daily
          challenge progress, and a rolling history of your recent scores (used to power
          the Stats page) are stored locally in your browser (localStorage) and are never
          sent to us. You can clear this history at any time from the Stats page.
        </p>
        <p>
          If you choose to submit a score to a global leaderboard, we store an anonymous,
          randomly generated player ID, the score, the game mode, a timestamp, and an optional
          display name you choose. We do not require or knowingly collect names, emails, or
          other personal information for basic gameplay.
        </p>
        <p>
          If analytics or advertising are enabled on this site, only aggregate, non-identifying
          event data (such as which game mode was played) is collected, and this page will be
          updated with details of any consent mechanism required in your region.
        </p>
        <p>
          This page is a plain-language summary and not a substitute for a formal legal privacy
          policy; consult a lawyer before relying on it for compliance purposes.
        </p>
      </div>
    </div>
  );
}
