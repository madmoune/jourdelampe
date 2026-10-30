export const ZEBRA_CATEGORIES = {
  position: { label: 'Position', values: ['1', '4', '5', '11', '18', '6', '3', '2'] },
  name: { label: 'Nom', values: ['Bob', 'Jean-Lou', 'Homer', 'Éric'] },
  occupation: {
    label: 'Occupation',
    // L’ordre interne conserve les marques sauvegardées et l’encodage de validation.
    values: ['Pilote', 'Animateur', 'Inspecteur', 'Étudiant'],
    displayOrder: [3, 1, 0, 2],
  },
  food: { label: 'Nourriture', values: ['Hot-dog', 'Pogo', 'Cheesy Poofs', 'Beigne'] },
} as const;

export type CategoryId = keyof typeof ZEBRA_CATEGORIES;
export interface ZebraBlock {
  readonly id: string;
  readonly row: CategoryId;
  readonly column: CategoryId;
}
// L’ordre sert également à encoder une grille complète pour sa vérification privée.
export const ZEBRA_BLOCKS: readonly ZebraBlock[] = [
  { id: 'name-position', row: 'name', column: 'position' },
  { id: 'occupation-position', row: 'occupation', column: 'position' },
  { id: 'occupation-name', row: 'occupation', column: 'name' },
  { id: 'food-position', row: 'food', column: 'position' },
  { id: 'food-name', row: 'food', column: 'name' },
  { id: 'food-occupation', row: 'food', column: 'occupation' },
];
export const ZEBRA_ASSOCIATION_COUNT = ZEBRA_BLOCKS.reduce(
  (count, block) =>
    count + ZEBRA_CATEGORIES[block.row].values.length * (block.column === 'position' ? 2 : 1),
  0,
);
export type ZebraMarks = Readonly<Record<string, 'yes' | 'no'>>;
export type ZebraCell = 'yes' | 'no' | 'blocked' | 'empty';
export const cellKey = (block: string, row: number, column: number): string =>
  `${block}:${row}:${column}`;

export function cellState(
  marks: ZebraMarks,
  block: ZebraBlock,
  row: number,
  column: number,
): ZebraCell {
  if (marks[cellKey(block.id, row, column)] === 'yes') return 'yes';
  let selectedInRow = 0;
  for (let other = 0; other < ZEBRA_CATEGORIES[block.column].values.length; other++) {
    if (other !== column && marks[cellKey(block.id, row, other)] === 'yes') selectedInRow++;
  }
  if (selectedInRow >= (block.column === 'position' ? 2 : 1)) return 'blocked';
  let selectedInColumn = 0;
  for (let other = 0; other < ZEBRA_CATEGORIES[block.row].values.length; other++) {
    if (other !== row && marks[cellKey(block.id, other, column)] === 'yes') selectedInColumn++;
  }
  if (selectedInColumn >= (block.row === 'position' ? 2 : 1)) return 'blocked';
  return marks[cellKey(block.id, row, column)] === 'no' ? 'no' : 'empty';
}

export function toggleCell(
  marks: ZebraMarks,
  block: ZebraBlock,
  row: number,
  column: number,
  mode: 'yes' | 'no',
): ZebraMarks {
  if (cellState(marks, block, row, column) === 'blocked') return marks;
  const key = cellKey(block.id, row, column);
  const next = { ...marks };
  if (next[key] === mode) delete next[key];
  else next[key] = mode;
  return next;
}

/** Deux positions par ligne dans les blocs Position; une association dans les autres blocs. */
export function encodeCompleteGrid(marks: ZebraMarks): string | null {
  const code: number[] = [];
  for (const block of ZEBRA_BLOCKS) {
    const selectedColumns = new Set<number>();
    for (let row = 0; row < ZEBRA_CATEGORIES[block.row].values.length; row++) {
      const selected = ZEBRA_CATEGORIES[block.column].values
        .map((_, column) => column)
        .filter((column) => marks[cellKey(block.id, row, column)] === 'yes');
      const required = block.column === 'position' ? 2 : 1;
      if (selected.length !== required || selected.some((column) => selectedColumns.has(column)))
        return null;
      selected.forEach((column) => selectedColumns.add(column));
      code.push(...selected.map((column) => column + 1));
    }
  }
  return code.join('');
}

export function parseMarks(value: unknown): ZebraMarks {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  let marks: ZebraMarks = {};
  for (const block of ZEBRA_BLOCKS) {
    ZEBRA_CATEGORIES[block.row].values.forEach((_, row) => {
      ZEBRA_CATEGORIES[block.column].values.forEach((_, column) => {
        const mark = (value as Record<string, unknown>)[cellKey(block.id, row, column)];
        if (mark === 'no') marks = { ...marks, [cellKey(block.id, row, column)]: 'no' };
        else if (mark === 'yes') marks = toggleCell(marks, block, row, column, mark);
      });
    });
  }
  return marks;
}
