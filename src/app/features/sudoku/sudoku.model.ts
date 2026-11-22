export const SUDOKU_SIZE = 9;
export const BOX_SIZE = 3;

export const SUDOKU_GIVENS: readonly number[] = [
  0, 4, 0, 6, 9, 0, 7, 0, 0,
  5, 7, 0, 1, 4, 2, 0, 8, 0,
  0, 0, 0, 5, 0, 0, 4, 2, 1,
  0, 5, 7, 3, 0, 4, 0, 9, 0,
  2, 0, 0, 0, 5, 7, 1, 0, 0,
  3, 0, 0, 2, 0, 9, 5, 0, 0,
  0, 0, 5, 0, 3, 0, 0, 0, 4,
  0, 3, 1, 0, 0, 6, 8, 0, 0,
  4, 0, 0, 0, 0, 0, 0, 0, 7,
];

export const FLAG_DIGITS: readonly (readonly [number, number])[] = [
  [9, 1],
  [5, 6],
  [3, 7],
  [1, 3],
  [6, 1],
  [2, 7],
  [5, 4],
  [1, 9],
  [4, 1],
];

export function boxCell(box: number, cell: number): number {
  const row = BOX_SIZE * Math.floor(box / BOX_SIZE) + Math.floor(cell / BOX_SIZE);
  const column = BOX_SIZE * (box % BOX_SIZE) + (cell % BOX_SIZE);
  return row * SUDOKU_SIZE + column;
}

const positions = Array.from({ length: SUDOKU_SIZE }, (_, index) => index);
export const SUDOKU_UNITS: readonly (readonly number[])[] = [
  ...positions.map((row) => positions.map((column) => row * SUDOKU_SIZE + column)),
  ...positions.map((column) => positions.map((row) => row * SUDOKU_SIZE + column)),
  ...positions.map((box) => positions.map((cell) => boxCell(box, cell))),
];

export function isCompleteSudoku(board: readonly number[]): boolean {
  return (
    board.length === SUDOKU_GIVENS.length &&
    board.every(
      (digit, index) =>
        Number.isInteger(digit) &&
        digit >= 1 &&
        digit <= SUDOKU_SIZE &&
        (!SUDOKU_GIVENS[index] || digit === SUDOKU_GIVENS[index]),
    ) &&
    SUDOKU_UNITS.every((unit) => new Set(unit.map((index) => board[index])).size === SUDOKU_SIZE)
  );
}

export function flagCells(board: readonly number[], box: number): number[] {
  return positions.filter((cell) => FLAG_DIGITS[box].includes(board[boxCell(box, cell)]));
}
