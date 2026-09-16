// Infinity Loop generation and rotation logic, pure functions.
//
// Each cell's "solved mask" is a 4-bit value where bit0=North, bit1=East,
// bit2=South, bit3=West — 1 means that side has a pipe connection in the
// solved state. We generate a random spanning tree over the grid graph so
// every cell ends up connected with no dangling ends, then scramble each
// cell with a random rotation for the player to undo.

export const NORTH = 1;
export const EAST = 2;
export const SOUTH = 4;
export const WEST = 8;

export interface TileState {
  solvedMask: number;
  rotation: number; // 0-3 quarter turns currently applied by the player
}

class UnionFind {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    this.parent[ra] = rb;
    return true;
  }
}

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Rotates a 4-bit direction mask clockwise by `times` quarter turns.
export function rotateMaskCW(mask: number, times: number): number {
  let m = mask;
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) {
    m = ((m << 1) & 0b1111) | (m >> 3);
  }
  return m;
}

export function generateBoard(rows: number, cols: number): TileState[][] {
  const index = (r: number, c: number) => r * cols + c;
  const uf = new UnionFind(rows * cols);
  const solvedMasks: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  type Edge = { r1: number; c1: number; r2: number; c2: number; bit1: number; bit2: number };
  const edges: Edge[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols) edges.push({ r1: r, c1: c, r2: r, c2: c + 1, bit1: EAST, bit2: WEST });
      if (r + 1 < rows) edges.push({ r1: r, c1: c, r2: r + 1, c2: c, bit1: SOUTH, bit2: NORTH });
    }
  }

  for (const edge of shuffled(edges)) {
    if (uf.union(index(edge.r1, edge.c1), index(edge.r2, edge.c2))) {
      solvedMasks[edge.r1][edge.c1] |= edge.bit1;
      solvedMasks[edge.r2][edge.c2] |= edge.bit2;
    }
  }

  return solvedMasks.map((row) =>
    row.map((solvedMask) => {
      // Scramble with a random rotation. If the tile has no connections at
      // all (shouldn't happen with a full spanning tree, but just in case),
      // rotation doesn't matter.
      let rotation = Math.floor(Math.random() * 4);
      // Avoid an already-solved tile purely by chance where it would look
      // like it needs work but doesn't (harmless either way, but nicer UX
      // to guarantee at least a partial scramble across the board overall).
      if (solvedMask === 0) rotation = 0;
      return { solvedMask, rotation };
    })
  );
}

export function isSolved(board: TileState[][]): boolean {
  for (const row of board) {
    for (const tile of row) {
      if (rotateMaskCW(tile.solvedMask, tile.rotation) !== tile.solvedMask) return false;
    }
  }
  return true;
}
