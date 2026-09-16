import type { Metadata } from "next";
import { InfinityLoopGame } from "./InfinityLoopGame";

export const metadata: Metadata = {
  title: "Infinity Loop",
  description: "Rotate the tiles to connect every pipe. No dangling ends, no crossed wires.",
};

export default function InfinityLoopPage() {
  return <InfinityLoopGame />;
}
