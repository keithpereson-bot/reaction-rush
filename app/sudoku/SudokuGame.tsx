"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  generatePuzzle,
  findConflicts,
  isBoardComplete,
  type Grid,
  type Difficulty,
} from "@/games/sudoku/engine";
import { getPersonalBest, maybeSetPersonalBest } from "@/lib/storage";
import { recordHistory } from "@/lib/history";
import { PersonalBest } from "@/components/PersonalBest";
import { track } from "@/lib/analytics";
import { sfx, useSoundPreference } from "@/lib/sound";

type Cell = { row: number; col: number };

function cloneGrid(g: Grid): Grid {
  return g.map((row) => [...row]);
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);
  const [board, setBoard] = useState<Grid | null>(null);
  const [notes, setNotes] = useState<boolean[][][] | null>(null); // [row][col][digit-1]
  const [selected, setSelected] = useState<Cell | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [solved, setSolved] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const sound = useSoundPreference();

  const newGame = useCallback((diff: Difficulty) => {
    const { puzzle: p, solution: s } = generatePuzzle(diff);
    setPuzzle(p);
    setSolution(s);
    setBoard(cloneGrid(p));
    setNotes(
      Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(false)))
    );
    setSelected(null);
    setSolved(false);
    setIsNewBest(false);
    setElapsedMs(0);
    startTimeRef.current = Date.now();
    track("game_started", { mode: `sudoku-${diff}` });
  }, []);

  useEffect(() => {
    newGame("easy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPersonalBest(getPersonalBest(`sudoku-${difficulty}`));
  }, [difficulty]);

  // Live timer
  useEffect(() => {
    if (solved || !board) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 500);
    return () => clearInterval(interval);
  }, [solved, board]);

  const conflicts = useMemo(() => (board ? findConflicts(board) : new Set<string>()), [board]);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    newGame(diff);
  };

  const setCellValue = useCallback(
    (row: number, col: number, value: number) => {
      if (!board || !puzzle || !solution || solved) return;
      if (puzzle[row][col] !== 0) return; // can't edit a clue

      if (notesMode) {
        setNotes((prev) => {
          if (!prev) return prev;
          const next = prev.map((r) => r.map((c) => [...c]));
          if (value >= 1 && value <= 9) {
            next[row][col][value - 1] = !next[row][col][value - 1];
          }
          return next;
        });
        return;
      }

      const nextBoard = cloneGrid(board);
      nextBoard[row][col] = value; // 0 clears
      setBoard(nextBoard);

      // Clear notes for this cell once it has a real value.
      if (value !== 0) {
        setNotes((prev) => {
          if (!prev) return prev;
          const next = prev.map((r) => r.map((c) => [...c]));
          next[row][col] = Array(9).fill(false);
          return next;
        });
      }

      if (value !== 0 && isBoardComplete(nextBoard, solution)) {
        const elapsed = Date.now() - startTimeRef.current;
        setSolved(true);
        setElapsedMs(elapsed);
        track("game_completed", { mode: `sudoku-${difficulty}`, ms: elapsed });
        recordHistory(`sudoku-${difficulty}-sessions`, { ms: elapsed });
        const gotNewBest = maybeSetPersonalBest(elapsed, `sudoku-${difficulty}`);
        setIsNewBest(gotNewBest);
        if (gotNewBest) {
          setPersonalBest(elapsed);
          track("personal_best", { mode: `sudoku-${difficulty}`, ms: elapsed });
          if (sound.enabled) sfx.personalBest();
        } else if (sound.enabled) {
          sfx.challengeComplete();
        }
      }
    },
    [board, puzzle, solution, solved, notesMode, difficulty, sound.enabled]
  );

  // Keyboard support: digits fill/toggle-note, backspace/delete clears, arrows move selection.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selected || !puzzle) return;
      const { row, col } = selected;

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        setCellValue(row, col, Number(e.key));
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        setCellValue(row, col, 0);
        return;
      }
      const moves: Record<string, Cell> = {
        ArrowUp: { row: Math.max(0, row - 1), col },
        ArrowDown: { row: Math.min(8, row + 1), col },
        ArrowLeft: { row, col: Math.max(0, col - 1) },
        ArrowRight: { row, col: Math.min(8, col + 1) },
      };
      if (moves[e.key]) {
        e.preventDefault();
        setSelected(moves[e.key]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, puzzle, setCellValue]);

  if (!board || !puzzle) {
    return <div className="mx-auto max-w-lg px-4 py-12 text-center text-white/50">Generating puzzle&hellip;</div>;
  }

  const selectedValue = selected ? board[selected.row][selected.col] : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-4 flex justify-center gap-2">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDifficultyChange(d)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              difficulty === d ? "bg-white text-base-950" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-white/60">
        <div>
          Time: <span className="font-semibold text-white">{formatTime(elapsedMs)}</span>
        </div>
        {personalBest !== null && (
          <div>
            Best: <span className="font-semibold text-white">{formatTime(personalBest)}</span>
          </div>
        )}
      </div>

      {solved ? (
        <div className="animate-pop-in rounded-3xl border border-white/5 bg-base-800 p-8 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Solved!</div>
          <div className="mt-4 font-display text-4xl font-bold text-white">{formatTime(elapsedMs)}</div>
          <div className="mt-6 flex justify-center">
            <PersonalBest ms={personalBest} isNewBest={isNewBest} />
          </div>
          <button
            type="button"
            onClick={() => newGame(difficulty)}
            className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950 transition-transform hover:scale-105"
          >
            New puzzle
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-9 gap-[1px] overflow-hidden rounded-xl border-2 border-white/20 bg-white/20">
            {board.map((rowArr, row) =>
              rowArr.map((value, col) => {
                const isFixed = puzzle[row][col] !== 0;
                const isSelected = selected?.row === row && selected?.col === col;
                const isConflict = conflicts.has(`${row}-${col}`);
                const isSameValue = value !== 0 && value === selectedValue;
                const cellNotes = notes?.[row]?.[col];

                const borderRight = col === 2 || col === 5 ? "border-r-2 border-r-white/20" : "";
                const borderBottom = row === 2 || row === 5 ? "border-b-2 border-b-white/20" : "";

                return (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    onClick={() => setSelected({ row, col })}
                    className={`relative flex aspect-square items-center justify-center text-lg font-semibold sm:text-xl ${borderRight} ${borderBottom} ${
                      isSelected
                        ? "bg-accent/30"
                        : isSameValue
                          ? "bg-white/10"
                          : "bg-base-800 hover:bg-base-700"
                    } ${isFixed ? "text-white" : isConflict ? "text-wait" : "text-blue-300"}`}
                  >
                    {value !== 0 ? (
                      value
                    ) : cellNotes && cellNotes.some(Boolean) ? (
                      <div className="grid grid-cols-3 gap-0 text-[8px] leading-none text-white/40 sm:text-[9px]">
                        {cellNotes.map((on, i) => (
                          <span key={i}>{on ? i + 1 : ""}</span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setNotesMode((v) => !v)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                notesMode ? "bg-accent text-base-950" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {notesMode ? "Notes: On" : "Notes: Off"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                type="button"
                disabled={!selected}
                onClick={() => selected && setCellValue(selected.row, selected.col, n)}
                className="aspect-square rounded-lg bg-base-800 text-lg font-semibold text-white transition-colors hover:bg-base-700 disabled:opacity-30"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && setCellValue(selected.row, selected.col, 0)}
              className="col-span-5 rounded-lg bg-white/5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 disabled:opacity-30 sm:col-span-1"
            >
              Erase
            </button>
          </div>
        </>
      )}
    </div>
  );
}
