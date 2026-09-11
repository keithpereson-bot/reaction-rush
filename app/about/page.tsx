import type { Metadata } from "next";
import { SITE } from "@/config/game";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">About {SITE.name}</h1>
      <div className="mt-6 space-y-4 text-white/70">
        <p>
          {SITE.name} is a small, fast browser game built around a simple question: how quickly
          can you react? It&rsquo;s the first game in a growing collection of quick, competitive
          browser games — no downloads, no accounts required to play.
        </p>
        <p>
          We built it to load fast, work well on any device, and give you an obvious reason to
          come back: your personal best, a daily target, and a global leaderboard to measure
          yourself against.
        </p>
      </div>
    </div>
  );
}
