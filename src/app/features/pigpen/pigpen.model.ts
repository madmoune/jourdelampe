export type CellMark = '' | 'pig' | 'cross';

export interface Nonogram {
  readonly rows: readonly (readonly number[])[];
  readonly columns: readonly (readonly number[])[];
}

export const PEN_SIZE = 7;
export const PIGPEN_PUZZLES: readonly Nonogram[] = [
  {
    rows: [[7], [1], [1], [1, 1], [1], [1], [1]],
    columns: [[7], [1], [1], [1, 1], [1], [1], [1]],
  },
  {
    rows: [[2], [3], [2], [2], [2], [3], [2]],
    columns: [[], [1], [5], [2, 2], [2, 2], [1, 1], []],
  },
  {
    rows: [[7], [1], [1], [1], [1], [1], [1]],
    columns: [[1], [1], [1], [1], [1], [1], [7]],
  },
  {
    rows: [[], [5], [1], [1, 1], [1], [1], []],
    columns: [[], [5], [1], [1, 1], [1], [1], []],
  },
  {
    rows: [[1], [1], [1], [1], [1], [1], [7]],
    columns: [[1], [1], [1], [1], [1], [1], [7]],
  },
  {
    rows: [[2], [3], [2], [2], [2], [3], [2]],
    columns: [[], [1, 1], [2, 2], [2, 2], [5], [1], []],
  },
  {
    rows: [[], [1, 1], [2, 2], [2, 2], [5], [1], []],
    columns: [[2], [3], [2], [2], [2], [3], [2]],
  },
];

export function runLengths(filled: readonly boolean[]): number[] {
  const result: number[] = [];
  let run = 0;
  for (const cell of filled) {
    if (cell) run++;
    else if (run) {
      result.push(run);
      run = 0;
    }
  }
  if (run) result.push(run);
  return result;
}

export function matchesClues(marks: readonly CellMark[], puzzle: Nonogram): boolean {
  const filled = (row: number, column: number) => marks[row * PEN_SIZE + column] === 'pig';
  const lineMatches = (line: readonly boolean[], clues: readonly number[]) =>
    runLengths(line).join() === clues.join();
  return (
    puzzle.rows.every((clues, row) =>
      lineMatches(puzzle.columns.map((_, col) => filled(row, col)), clues),
    ) &&
    puzzle.columns.every((clues, col) =>
      lineMatches(puzzle.rows.map((_, row) => filled(row, col)), clues),
    )
  );
}
