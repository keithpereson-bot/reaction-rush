import type { Metadata } from "next";
import { ChessGame } from "./ChessGame";

export const metadata: Metadata = {
  title: "Chess",
  description: "Play chess locally with a friend, or against a built-in AI opponent.",
};

export default function ChessPage() {
  return <ChessGame />;
}
