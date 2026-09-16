"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateBoard, isSolved, NORTH, EAST, SOUTH, type TileState } from "@/games/infinity-loop/engine";
import { getPersonalBest, maybeSetPersonalBest } from "@/lib/storage";
import { recordHistory } from "@/lib/history";
import { PersonalBest } from "@/components/PersonalBest";
import { track } from "@/lib/analytics";
import { sfx, useSoundPreference } from "@/lib/sound";

type Size = "small" | "medium" | "large";

const SIZE_DIMS: Record<Size, { rows: number; cols: number; label: string }> = {
  small: { rows: 5, cols: 5, label: "Small" },
  medium: { rows: 6, cols: 6, label: "Medium" },
  large: { rows: 8, cols: 8, label: "Large" },
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Tile({ mask, rotation, solved, onClick }: { mask: number; rotation: number; solved: boolean; onClick: () => void }) {
  const color = solved ? "#a3ff12" : "rgba(255,255,255,0.75)";
  const hasN = (mask & NORTH) !== 0;
  const hasE = (mask & EAST) !== 0;
  const hasS = (mask & SOUTH) !== 0;
  const hasW = (mask & 8) !== 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Rotate tile"
      className="relative aspect-square w-full bg-base-800 transition-colors hover:bg-base-700"
    >
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transform: `rotate(${rotation * 90}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {hasN && <rect x={44} y={0} width={12} height={54} fill={color} />}
          {hasE && <rect x={46} y={44} width={54} height={12} fill={color} />}
          {hasS && <rect x={44} y={46} width={12} height={54} fill={color} />}
          {hasW && <rect x={0} y={44} width={54} height={12} fill={color} />}
          {mask !== 0 && <circle cx={50} cy={50} r={11} fill={color} />}
        </svg>
      </div>
    </button>
  );
}

export function InfinityLoopGame() {
  const [size, setSize] = useState<Size>("medium");
  const [board, setBoard] = useState<TileState[][] | null>(null);
  const [solved, setSolved] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const sound = useSoundPreference();

  const newGame = useCallback((s: Size) => {
    const { rows, cols } = SIZE_DIMS[s];
    setBoard(generateBoard(rows, cols));
    setSolved(false);
    setIsNewBest(false);
    setElapsedMs(0);
    startTimeRef.current = Date.now();
    track("game_started", { mode: `infinity-loop-${s}` });
  }, []);

  useEffect(() => {
    newGame("medium");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPersonalBest(getPersonalBest(`infinity-loop-${size}`));
  }, [size]);

  useEffect(() => {
    if (solved || !board) return;
    const interval = setInterval(() => setElapsedMs(Date.now() - startTimeRef.current), 500);
    return () => clearInterval(interval);
  }, [solved, board]);

  function handleSizeChange(s: Size) {
    setSize(s);
    newGame(s);
  }

  function rotateTile(row: number, col: number) {
    if (!board || solved) return;
    const next = board.map((r) => r.map((t) => ({ ...t })));
    next[row][col].rotation = (next[row][col].rotation + 1) % 4;
    setBoard(next);
    if (sound.enabled) sfx.go();

    if (isSolved(next)) {
      const elapsed = Date.now() - startTimeRef.current;
      setSolved(true);
      setElapsedMs(elapsed);
      track("game_completed", { mode: `infinity-loop-${size}`, ms: elapsed });
      recordHistory(`infinity-loop-${size}-sessions`, { ms: elapsed });
      const gotNewBest = maybeSetPersonalBest(elapsed, `infinity-loop-${size}`);
      setIsNewBest(gotNewBest);
      if (gotNewBest) {
        setPersonalBest(elapsed);
        track("personal_best", { mode: `infinity-loop-${size}`, ms: elapsed });
        if (sound.enabled) sfx.personalBest();
      } else if (sound.enabled) {
        sfx.challengeComplete();
      }
    }
  }

  if (!board) {
    return <div className="mx-auto max-w-lg px-4 py-12 text-center text-white/50">Generating puzzle&hellip;</div>;
  }

  const { cols } = SIZE_DIMS[size];

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-4 flex justify-center gap-2">
        {(Object.keys(SIZE_DIMS) as Size[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSizeChange(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              size === s ? "bg-white text-base-950" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {SIZE_DIMS[s].label}
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
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Connected!</div>
          <div className="mt-4 font-display text-4xl font-bold text-white">{formatTime(elapsedMs)}</div>
          <div className="mt-6 flex justify-center">
            <PersonalBest ms={personalBest} isNewBest={isNewBest} />
          </div>
          <button
            type="button"
            onClick={() => newGame(size)}
            className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950 transition-transform hover:scale-105"
          >
            New puzzle
          </button>
        </div>
      ) : (
        <>
          <div
            className="grid gap-[2px] overflow-hidden rounded-xl border border-white/10 bg-white/10"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {board.map((row, r) =>
              row.map((tile, c) => (
                <Tile
                  key={`${r}-${c}`}
                  mask={tile.solvedMask}
                  rotation={tile.rotation}
                  solved={solved}
                  onClick={() => rotateTile(r, c)}
                />
              ))
            )}
          </div>
          <p className="mt-4 text-center text-sm text-white/40">
            Tap a tile to rotate it. Connect every pipe with no loose ends.
          </p>
        </>
      )}
    </div>
  );
}
