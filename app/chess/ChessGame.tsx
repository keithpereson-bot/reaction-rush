"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { pickAiMove } from "@/games/chess/ai";
import { getChessRecord, recordChessResult, type ChessRecord } from "@/games/chess/record";
import { track } from "@/lib/analytics";
import { sfx, useSoundPreference } from "@/lib/sound";

type Mode = "local" | "ai";
// chess.js's Square/PieceSymbol types aren't exported from the package, only
// used internally — so we use plain strings on our side and cast at the
// handful of call sites where chess.js's API expects its exact literal type.
type Sq = string;
type PromoPiece = "q" | "r" | "b" | "n";

const PIECE_GLYPHS: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PROMOTION_PIECES: { code: PromoPiece; label: string }[] = [
  { code: "q", label: "Queen" },
  { code: "r", label: "Rook" },
  { code: "b", label: "Bishop" },
  { code: "n", label: "Knight" },
];

export function ChessGame() {
  const chessRef = useRef(new Chess());
  const [mode, setMode] = useState<Mode>("local");
  const [, forceRender] = useState(0);
  const [selected, setSelected] = useState<Sq | null>(null);
  const [legalTargets, setLegalTargets] = useState<Sq[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Sq; to: Sq } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [record, setRecord] = useState<ChessRecord>({ wins: 0, losses: 0, draws: 0 });
  const [resultRecorded, setResultRecorded] = useState(false);
  const sound = useSoundPreference();

  useEffect(() => {
    setRecord(getChessRecord());
  }, []);

  const bump = useCallback(() => forceRender((n) => n + 1), []);

  const newGame = useCallback((m: Mode) => {
    chessRef.current = new Chess();
    setMode(m);
    setSelected(null);
    setLegalTargets([]);
    setPendingPromotion(null);
    setAiThinking(false);
    setResultRecorded(false);
    track("game_started", { mode: m === "ai" ? "chess-ai" : "chess-local" });
    bump();
  }, [bump]);

  const chess = chessRef.current;
  const isGameOver = chess.isGameOver();

  // Record the result exactly once when the game ends in AI mode.
  useEffect(() => {
    if (!isGameOver || resultRecorded || mode !== "ai") return;
    let outcome: "win" | "loss" | "draw" = "draw";
    if (chess.isCheckmate()) {
      // The side to move is the one who got checkmated.
      outcome = chess.turn() === "w" ? "loss" : "win";
    }
    const next = recordChessResult(outcome);
    setRecord(next);
    setResultRecorded(true);
    track("game_completed", { mode: "chess-ai", outcome });
    if (sound.enabled) {
      if (outcome === "win") sfx.personalBest();
      else if (outcome === "loss") sfx.incorrect();
      else sfx.resultReveal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, resultRecorded, mode]);

  // AI's turn: pick and play a move shortly after the board updates.
  useEffect(() => {
    if (mode !== "ai" || isGameOver || chess.turn() !== "b" || pendingPromotion) return;
    setAiThinking(true);
    const timeout = setTimeout(() => {
      const move = pickAiMove(chessRef.current, 2);
      if (move) {
        chessRef.current.move(move);
        if (sound.enabled) sfx.go();
      }
      setAiThinking(false);
      bump();
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isGameOver, pendingPromotion, chess.turn(), bump]);

  function squareFromRowCol(displayRow: number, col: number): Sq {
    const rank = 8 - displayRow;
    return `${FILES[col]}${rank}` as Sq;
  }

  function handleSquareClick(square: Sq) {
    if (isGameOver || aiThinking || pendingPromotion) return;
    if (mode === "ai" && chess.turn() === "b") return; // AI's turn, ignore clicks

    if (selected && legalTargets.includes(square)) {
      const candidateMoves = chess.moves({ square: selected as any, verbose: true });
      const needsPromotion = candidateMoves.some((m) => m.to === square && m.flags.includes("p"));
      if (needsPromotion) {
        setPendingPromotion({ from: selected, to: square });
        setSelected(null);
        setLegalTargets([]);
        return;
      }
      chess.move({ from: selected as any, to: square as any });
      if (sound.enabled) sfx.go();
      setSelected(null);
      setLegalTargets([]);
      bump();
      return;
    }

    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      setSelected(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setLegalTargets(moves.map((m) => m.to as Sq));
    } else {
      setSelected(null);
      setLegalTargets([]);
    }
  }

  function resolvePromotion(piece: PromoPiece) {
    if (!pendingPromotion) return;
    chess.move({ from: pendingPromotion.from as any, to: pendingPromotion.to as any, promotion: piece });
    if (sound.enabled) sfx.go();
    setPendingPromotion(null);
    bump();
  }

  const board = chess.board();
  const history = chess.history();

  let statusText = "";
  if (isGameOver) {
    if (chess.isCheckmate()) {
      statusText = `Checkmate — ${chess.turn() === "w" ? "Black" : "White"} wins`;
    } else if (chess.isStalemate()) {
      statusText = "Stalemate — draw";
    } else {
      statusText = "Draw";
    }
  } else if (chess.isCheck()) {
    statusText = `${chess.turn() === "w" ? "White" : "Black"} is in check`;
  } else {
    statusText = mode === "ai" && chess.turn() === "b" ? "AI is thinking…" : `${chess.turn() === "w" ? "White" : "Black"} to move`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => newGame("local")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            mode === "local" ? "bg-white text-base-950" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          2-Player
        </button>
        <button
          type="button"
          onClick={() => newGame("ai")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            mode === "ai" ? "bg-white text-base-950" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          vs. AI
        </button>
      </div>

      {mode === "ai" && (
        <div className="mb-4 flex justify-center gap-6 text-xs text-white/50">
          <span>Wins: <span className="font-semibold text-white">{record.wins}</span></span>
          <span>Losses: <span className="font-semibold text-white">{record.losses}</span></span>
          <span>Draws: <span className="font-semibold text-white">{record.draws}</span></span>
        </div>
      )}

      <div className="mb-4 text-center text-sm font-medium text-white/70">{statusText}</div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div className="relative">
          <div className="grid grid-cols-8 overflow-hidden rounded-xl border border-white/10">
            {board.map((row, displayRow) =>
              row.map((piece, col) => {
                const square = squareFromRowCol(displayRow, col);
                const isLight = (displayRow + col) % 2 === 0;
                const isSelected = selected === square;
                const isTarget = legalTargets.includes(square);

                return (
                  <button
                    key={square}
                    type="button"
                    onClick={() => handleSquareClick(square)}
                    className={`relative flex aspect-square w-10 items-center justify-center text-2xl sm:w-14 sm:text-4xl ${
                      isLight ? "bg-base-700" : "bg-base-900"
                    } ${isSelected ? "outline outline-2 outline-accent" : ""}`}
                  >
                    {piece && (
                      <span
                        className={piece.color === "w" ? "text-white drop-shadow-md" : "text-black drop-shadow-md"}
                      >
                        {PIECE_GLYPHS[`${piece.color}${piece.type}`]}
                      </span>
                    )}
                    {isTarget && (
                      <span
                        className={`pointer-events-none absolute rounded-full ${
                          piece ? "inset-1 border-2 border-accent/80" : "h-3 w-3 bg-accent/70"
                        }`}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {pendingPromotion && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/80">
              <div className="rounded-2xl bg-base-800 p-4 text-center">
                <div className="mb-3 text-sm font-semibold text-white">Promote to:</div>
                <div className="flex gap-2">
                  {PROMOTION_PIECES.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => resolvePromotion(p.code)}
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/80">
              <div className="rounded-2xl bg-base-800 p-6 text-center">
                <div className="font-display text-lg font-bold text-white">{statusText}</div>
                <button
                  type="button"
                  onClick={() => newGame(mode)}
                  className="mt-4 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
                >
                  New game
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-xs rounded-2xl border border-white/5 bg-base-800 p-4 sm:w-48">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Moves</div>
          <div className="max-h-64 overflow-y-auto text-sm text-white/70">
            {history.length === 0 ? (
              <div className="text-white/30">No moves yet</div>
            ) : (
              <ol className="space-y-1">
                {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-6 text-white/30">{i + 1}.</span>
                    <span>{history[i * 2]}</span>
                    <span className="text-white/50">{history[i * 2 + 1] ?? ""}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
