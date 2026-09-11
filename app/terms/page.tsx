import type { Metadata } from "next";
import { SITE } from "@/config/game";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Terms</h1>
      <div className="mt-6 space-y-4 text-white/70">
        <p>
          {SITE.name} is provided for entertainment purposes. Reaction time results are not a
          medical, scientific, or professional assessment of any kind.
        </p>
        <p>
          Any global leaderboard is intended for friendly competition. We reserve the right to
          remove scores that appear to be the result of automation, exploits, or other
          manipulation of the game or its timing.
        </p>
        <p>
          This page is a plain-language summary and not a substitute for formal legal terms of
          service; consult a lawyer before relying on it for compliance purposes.
        </p>
      </div>
    </div>
  );
}
