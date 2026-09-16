// Sudoku generation and validation. Pure functions, no React — this can be
// unit tested or reused independent of the UI.

export type Grid = number[][]; // 9x9, 0 = empty

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSafe(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

// Fills the grid in place via randomized backtracking. Returns true on success.
function fillGrid(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) continue;
      for (const num of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (isSafe(grid, row, col, num)) {
          grid[row][col] = num;
          if (fillGrid(grid)) return true;
          grid[row][col] = 0;
        }
      }
      return false; // no valid number here — backtrack
    }
  }
  return true; // no empty cells left
}

// Counts solutions up to `limit`, stopping early once reached (for uniqueness
// checks we only care whether there are 0, 1, or "more than 1" solutions).
function countSolutions(grid: Grid, limit: number): number {
  let count = 0;

  function search(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) continue;
        for (let num = 1; num <= 9; num++) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (search()) return true; // limit reached — unwind immediately
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
    count++;
    return count >= limit;
  }

  search();
  return count;
}

export function generateSolvedGrid(): Grid {
  const grid = emptyGrid();
  fillGrid(grid);
  return grid;
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution = generateSolvedGrid();
  const puzzle = cloneGrid(solution);

  const targetClues = DIFFICULTY_CLUES[difficulty];
  const positions = shuffled(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let clueCount = 81;
  for (const { row, col } of positions) {
    if (clueCount <= targetClues) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    const testGrid = cloneGrid(puzzle);
    const solutions = countSolutions(testGrid, 2);
    if (solutions === 1) {
      clueCount--;
    } else {
      puzzle[row][col] = backup; // removing this cell breaks uniqueness — keep it
    }
  }

  return { puzzle, solution };
}

export function isBoardComplete(board: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

// Returns the set of cell keys ("row-col") that currently violate a Sudoku
// rule (duplicate in row, column, or box), for live conflict highlighting.
export function findConflicts(board: Grid): Set<string> {
  const conflicts = new Set<string>();

  function checkGroup(cells: [number, number][]) {
    const seen = new Map<number, [number, number][]>();
    for (const [r, c] of cells) {
      const val = board[r][c];
      if (val === 0) continue;
      const list = seen.get(val) ?? [];
      list.push([r, c]);
      seen.set(val, list);
    }
    for (const list of seen.values()) {
      if (list.length > 1) {
        for (const [r, c] of list) conflicts.add(`${r}-${c}`);
      }
    }
  }

  for (let r = 0; r < 9; r++) {
    checkGroup(Array.from({ length: 9 }, (_, c) => [r, c]));
  }
  for (let c = 0; c < 9; c++) {
    checkGroup(Array.from({ length: 9 }, (_, r) => [r, c]));
  }
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells: [number, number][] = [];
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          cells.push([r, c]);
        }
      }
      checkGroup(cells);
    }
  }

  return conflicts;
}
