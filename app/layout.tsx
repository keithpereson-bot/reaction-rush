import type { Metadata } from "next";
import "./globals.css";
import { GameNavigation } from "@/components/GameNavigation";
import { SITE } from "@/config/game";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Reaction Time Test`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Test your reaction speed with a free online reaction time test. Get your score in milliseconds, beat your personal best and challenge your friends.",
  openGraph: {
    title: `${SITE.name} — Reaction Time Test`,
    description: SITE.tagline,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Reaction Time Test`,
    description: SITE.tagline,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-950 font-sans text-white antialiased">
        <GameNavigation />
        <main>{children}</main>
        <footer className="border-t border-white/5 py-8 text-center text-sm text-white/40">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4">
            <div>
              &copy; {new Date().getFullYear()} {SITE.name}
            </div>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-white/70">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white/70">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white/70">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
