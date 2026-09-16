import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.tagline,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
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

        {/* Vercel Analytics + Speed Insights — zero-config, visible in your
            Vercel project dashboard under the Analytics / Speed Insights tabs. */}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics 4 — only loads if a measurement ID is configured. */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
