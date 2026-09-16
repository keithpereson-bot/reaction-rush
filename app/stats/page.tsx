import type { Metadata } from "next";
import { StatsPage } from "./StatsPage";

export const metadata: Metadata = {
  title: "Your Stats",
  description: "Track your reaction time trend, accuracy, and personal bests across every game.",
};

export default function Stats() {
  return <StatsPage />;
}
