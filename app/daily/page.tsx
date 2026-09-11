import type { Metadata } from "next";
import { DailyChallenge } from "./DailyChallenge";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description: "A new reaction time target every day. Can you beat it?",
};

export default function DailyPage() {
  return <DailyChallenge />;
}
