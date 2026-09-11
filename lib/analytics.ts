// Minimal analytics abstraction. Swap the implementation of `track` for a
// real provider without touching call sites throughout the app.
//
// If NEXT_PUBLIC_GA_MEASUREMENT_ID is set, events are forwarded to Google
// Analytics (gtag). Otherwise events are just logged in development so the
// event names/shape can be reviewed before wiring up a provider.

export type AnalyticsEvent =
  | "page_view"
  | "game_started"
  | "game_completed"
  | "false_start"
  | "replay"
  | "personal_best"
  | "share_clicked"
  | "daily_challenge_started"
  | "daily_challenge_completed"
  | "five_round_completed";

type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, props: EventProps = {}): void {
  if (typeof window === "undefined") return;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (gaId && typeof window.gtag === "function") {
    window.gtag("event", event, props);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props);
  }
}
