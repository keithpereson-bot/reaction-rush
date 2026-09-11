import type { Metadata } from "next";
import { ImpossibleColorGame } from "./ImpossibleColorGame";

export const metadata: Metadata = {
  title: "Impossible Color — Stroop Test",
  description:
    "Say the color, not the word. A fast-paced Stroop test that measures how quickly you can override your instincts.",
};

export default function ImpossibleColorPage() {
  return <ImpossibleColorGame />;
}
