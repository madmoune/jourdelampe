export const ZEBRA_CATEGORIES = {
  position: { label: 'Position', values: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  name: { label: 'Nom', values: ['Bob', 'Jean-Lou', 'Homer', 'Éric'] },
  occupation: {
    label: 'Occupation',
    values: ['Pilote', 'Animateur radio', 'Responsable de la sécurité', 'Étudiant'],
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
  for (let other = 0; other < ZEBRA_CATEGORIES[block.column].values.length; other++) {
    if (other !== column && marks[cellKey(block.id, row, other)] === 'yes') return 'blocked';
  }
  for (let other = 0; other < ZEBRA_CATEGORIES[block.row].values.length; other++) {
    if (other !== row && marks[cellKey(block.id, other, column)] === 'yes') return 'blocked';
  }
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

/** Six blocs de quatre associations; les positions inutilisées restent possibles. */
export function encodeCompleteGrid(marks: ZebraMarks): string | null {
  const code: number[] = [];
  for (const block of ZEBRA_BLOCKS) {
    const selectedColumns = new Set<number>();
    for (let row = 0; row < ZEBRA_CATEGORIES[block.row].values.length; row++) {
      const selected = ZEBRA_CATEGORIES[block.column].values
        .map((_, column) => column)
        .filter((column) => marks[cellKey(block.id, row, column)] === 'yes');
      if (selected.length !== 1 || selectedColumns.has(selected[0])) return null;
      selectedColumns.add(selected[0]);
      code.push(selected[0] + 1);
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
