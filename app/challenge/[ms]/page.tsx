import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: { ms: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const ms = Number(params.ms);
  const valid = Number.isFinite(ms) && ms > 0;
  return {
    title: valid ? `Beat ${ms} ms?` : "Reaction Rush Challenge",
    description: valid
      ? `Someone scored ${ms} ms on Reaction Rush. Think you can beat it?`
      : "Test your reaction speed on Reaction Rush.",
  };
}

export default function ChallengePage({ params }: Props) {
  const ms = Number(params.ms);
  const valid = Number.isFinite(ms) && ms > 0 && ms < 5000;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Challenge</div>
      {valid ? (
        <h1 className="mt-4 font-display text-4xl font-bold text-white">
          Can you beat {ms} ms?
        </h1>
      ) : (
        <h1 className="mt-4 font-display text-4xl font-bold text-white">
          Test your reaction time
        </h1>
      )}
      <p className="mt-4 text-white/60">
        {valid
          ? "A friend just posted this score on Reaction Rush. Take the test and see if you can beat it."
          : "That challenge link looks incomplete, but you can still take the test."}
      </p>
      <Link
        href="/reaction"
        className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-bold text-base-950 transition-transform hover:scale-105"
      >
        Take the test
      </Link>
    </div>
  );
}
