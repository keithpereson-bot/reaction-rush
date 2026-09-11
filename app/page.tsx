import Link from "next/link";
import type { Metadata } from "next";
import { GameCard } from "@/components/GameCard";
import { SITE } from "@/config/game";

export const metadata: Metadata = {
  title: "Reaction Time Test – How Fast Are You?",
  description:
    "Test your reaction speed with a free online reaction time test. Get your score in milliseconds, beat your personal best and challenge your friends.",
};

const FAQ = [
  {
    q: "How does the reaction time test work?",
    a: "The screen shows a waiting state, then changes color at a random moment. The time between that change and your click or tap is your reaction time, measured in milliseconds.",
  },
  {
    q: "How is my reaction time calculated?",
    a: "We use the browser's high-resolution timer to record the exact moment the signal appears and the exact moment you respond, then take the difference.",
  },
  {
    q: "What affects browser reaction time?",
    a: "Your device, display refresh rate, input method, and even the browser itself all add a small amount of latency. Two people with identical reflexes can get slightly different numbers on different hardware.",
  },
  {
    q: "How can I improve my score?",
    a: "Practice helps you learn to anticipate the rhythm of the test less and react to the actual signal more. Playing a few rounds in the 5 Round Challenge tends to smooth out lucky or unlucky single attempts.",
  },
  {
    q: "Is this a scientific or medical test?",
    a: "No. Reaction Rush is built for fun and friendly competition, not as a diagnostic or research-grade instrument.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Can you beat your score?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">{SITE.tagline}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/reaction"
            className="rounded-full bg-accent px-8 py-4 text-base font-bold text-base-950 transition-transform hover:scale-105"
          >
            Play Reaction Rush
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-xl font-bold text-white">Games</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GameCard
            title="Reaction Rush"
            description="How fast can you click? Test your reaction time in milliseconds."
            href="/reaction"
          />
          <GameCard
            title="Daily Challenge"
            description="A new target every day. Can you beat it?"
            href="/daily"
          />
          <GameCard title="Memory" description="Remember the pattern before it disappears." comingSoon />
          <GameCard title="Typing Speed" description="How many words per minute can you type?" comingSoon />
          <GameCard title="Quick Math" description="Solve fast. Think faster." comingSoon />
          <GameCard title="Impossible Color" description="Say the color, not the word." comingSoon />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-2xl">
        <h2 className="font-display text-2xl font-bold text-white">Reaction Time Test</h2>
        <div className="mt-4 space-y-4 text-white/70">
          <p>
            Reaction Rush measures how quickly you respond to a visual signal. Wait for the
            screen to change, then click, tap, or press space as fast as you can. Your result
            is shown in milliseconds, right down to the number.
          </p>
          <p>
            Every round starts with a random delay so you can&rsquo;t predict the signal &mdash;
            that&rsquo;s what makes it a genuine reaction test rather than a rhythm game. Click
            too early and it counts as a false start instead of a score.
          </p>
          <p>
            Your personal best is saved on this device, so you always have something to chase.
            Try the 5 Round Challenge for a steadier read on your average speed, or the Daily
            Challenge for a new target every day.
          </p>
        </div>

        <h3 className="mt-10 font-display text-xl font-bold text-white">FAQ</h3>
        <div className="mt-4 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q}>
              <div className="font-semibold text-white">{item.q}</div>
              <div className="mt-1 text-white/60">{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
