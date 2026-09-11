import type { Metadata } from "next";
import { ReactionGame } from "./ReactionGame";

export const metadata: Metadata = {
  title: "Play — Reaction Time Test",
  description: "How fast are you? Test your reaction time and try to beat your personal best.",
};

export default function ReactionPage() {
  return <ReactionGame />;
}
