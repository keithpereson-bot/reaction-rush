import { Chess, type Move } from "chess.js";

// A lightweight AI opponent: minimax with alpha-beta pruning, material +
// simple positional evaluation. No opening book, no endgame tables — this
// is meant to be a fun casual opponent, not a strong engine.

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

// Small centre-control bonus, encourages less passive play without the cost
// of full piece-square tables.
const CENTER_BONUS: Record<string, number> = {
  d4: 10,
  d5: 10,
  e4: 10,
  e5: 10,
  c3: 4,
  c4: 4,
  c5: 4,
  c6: 4,
  f3: 4,
  f4: 4,
  f5: 4,
  f6: 4,
  d3: 4,
  d6: 4,
  e3: 4,
  e6: 4,
};

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    // The side to move is checkmated — very bad for them.
    return chess.turn() === "w" ? -100000 : 100000;
  }
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] + (CENTER_BONUS[piece.square] ?? 0);
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true }) as Move[];

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const score = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move(move);
      const score = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      best = Math.min(best, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// Picks a move for whichever side is currently to move. Depth 2 keeps this
// responsive (a few hundred ms, even in busy middlegame positions) — depth 3
// was measured at up to several seconds per move, too slow for a UI.
export function pickAiMove(chess: Chess, depth = 2): Move | null {
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;

  const maximizing = chess.turn() === "w";
  let bestMove: Move | null = null;
  let bestScore = maximizing ? -Infinity : Infinity;

  // Shuffle so the AI doesn't always play the same move among equally-good
  // options, without needing real randomness in the evaluation itself.
  const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

  for (const move of shuffledMoves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing);
    chess.undo();

    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
