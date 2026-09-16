import type { Metadata } from "next";
import { SudokuGame } from "./SudokuGame";

export const metadata: Metadata = {
  title: "Sudoku",
  description: "Classic Sudoku with three difficulty levels, notes, and a live timer.",
};

export default function SudokuPage() {
  return <SudokuGame />;
}
