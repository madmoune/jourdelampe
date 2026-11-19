import { matchesClues, type Nonogram, PEN_SIZE, PIGPEN_PUZZLES, runLengths } from './pigpen.model';

const lines = Array.from({ length: 2 ** PEN_SIZE }, (_, mask) =>
  Array.from({ length: PEN_SIZE }, (_, index) => (mask & (1 << index)) !== 0),
);

function solveWithLineClues(puzzle: Nonogram): (boolean | undefined)[] {
  const cells = Array<boolean | undefined>(PEN_SIZE ** 2).fill(undefined);
  const lineClues = [...puzzle.rows, ...puzzle.columns];
  const groups = lineClues.map((clues, line) => ({
    choices: lines.filter((candidate) => runLengths(candidate).join() === clues.join()),
    indices: Array.from({ length: PEN_SIZE }, (_, offset) =>
      line < PEN_SIZE ? line * PEN_SIZE + offset : offset * PEN_SIZE + line - PEN_SIZE,
    ),
  }));

  let changed: boolean;
  do {
    changed = false;
    for (const { choices, indices } of groups) {
      const possible = choices.filter((line) =>
        indices.every((index, offset) => cells[index] === undefined || cells[index] === line[offset]),
      );
      expect(possible.length).toBeGreaterThan(0);
      indices.forEach((index, offset) => {
        const value = possible[0][offset];
        if (cells[index] === undefined && possible.every((line) => line[offset] === value)) {
          cells[index] = value;
          changed = true;
        }
      });
    }
  } while (changed);
  return cells;
}

describe('les sept enclos', () => {
  it('contient exactement sept jeux d’indices de 7 × 7', () => {
    expect(PIGPEN_PUZZLES).toHaveLength(7);
    for (const puzzle of PIGPEN_PUZZLES) {
      expect(puzzle.rows).toHaveLength(PEN_SIZE);
      expect(puzzle.columns).toHaveLength(PEN_SIZE);
    }
  });

  it.each(PIGPEN_PUZZLES.filter((_, index) => index !== 1))(
    'détermine chaque case à partir des lignes et colonnes, une à la fois',
    (puzzle) => {
      const solution = solveWithLineClues(puzzle);
      expect(solution).not.toContain(undefined);
      const marks = solution.map((cell) => (cell ? 'pig' : ''));
      expect(matchesClues(marks, puzzle)).toBe(true);
      expect(matchesClues(solution.map((cell) => (cell ? 'pig' : 'cross')), puzzle)).toBe(true);
      marks[marks.indexOf('pig')] = '';
      expect(matchesClues(marks, puzzle)).toBe(false);
    },
  );

  it('admet une seule solution pour le chevron fin de l’enclos 2', () => {
    const puzzle = PIGPEN_PUZZLES[1];
    const candidates = (clues: readonly number[]) =>
      lines.filter((line) => runLengths(line).join() === clues.join());
    const rows = puzzle.rows.map(candidates);
    const solutions: boolean[][] = [];
    function search(board: boolean[], columns: readonly boolean[][][]): void {
      if (solutions.length > 1) return;
      const row = board.length / PEN_SIZE;
      if (row === PEN_SIZE) {
        solutions.push(board);
        return;
      }
      for (const candidate of rows[row]) {
        const remaining = columns.map((patterns, column) =>
          patterns.filter((line) => line[row] === candidate[column]),
        );
        if (remaining.every((patterns) => patterns.length)) {
          search([...board, ...candidate], remaining);
        }
      }
    }
    search([], puzzle.columns.map(candidates));
    expect(solutions).toHaveLength(1);
    const motif = ['0000110', '0001100', '0011000', '0110000', '0011000', '0001100', '0000110'];
    expect(solutions[0].map(Number).join('')).toBe(motif.join(''));
  });
});
