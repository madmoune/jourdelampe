export const GRID_WIDTH = 21;
export const GRID_HEIGHT = 24;
export const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

const MASK = [
  '######.......#####.##',
  '#######.##########.##',
  '#######.##########.##',
  '###.#.#.##..........#',
  '###.#.#.####.###.#.##',
  '...........#.###.#.##',
  '###.#.######......###',
  '###.#.####.#.###.##.#',
  '###........#.#.####.#',
  '###.#.####..........#',
  '#####.####.###.####.#',
  '#####.#.##.###.####.#',
  '#######.##.#.........',
  '#..........###.####.#',
  '.######.##.#.#.####.#',
  '.##......#.#.#.#.##.#',
  '.######.####.###.####',
  '..........#.......###',
  '.#.####.####.###.####',
  '.#.###.........#.####',
  '.#.#########.###.####',
  '.#.......#######.####',
  '.#.########........##',
  '##.##################',
].join('');

export type Direction = 'across' | 'down';
interface ClueData {
  readonly number: number;
  readonly direction: Direction;
  readonly start: number;
  readonly length: number;
  readonly text: string;
}

const CLUE_DATA: readonly ClueData[] = [
  { number: 1, direction: 'across', start: 6, length: 7, text: 'Nom de la plongeuse québécoise Émilie, plusieurs fois médaillée olympique.' },
  { number: 2, direction: 'down', start: 7, length: 6, text: 'Rappeur interprétant « The Real Slim Shady ».' },
  { number: 3, direction: 'down', start: 18, length: 6, text: 'Sous-marin russe dont le naufrage en mer de Barents a coûté la vie à 118 marins.' },
  { number: 4, direction: 'down', start: 66, length: 7, text: 'État américain où s’est joué le recomptage électoral entre Bush et Gore.' },
  { number: 5, direction: 'down', start: 68, length: 9, text: 'Film de Ridley Scott dans lequel Russell Crowe incarne Maximus.' },
  { number: 6, direction: 'across', start: 73, length: 10, text: 'Album des Cowboys Fringants où figure « Le Shack à Hector ».' },
  { number: 7, direction: 'down', start: 75, length: 7, text: 'Titre original du jeu de simulation de vie développé par Maxis.' },
  { number: 8, direction: 'down', start: 79, length: 5, text: 'Nom du journaliste québécois Michel, victime d’une tentative d’assassinat.' },
  { number: 9, direction: 'across', start: 105, length: 11, text: 'Jeu de Zelda où Link doit empêcher la Lune de s’écraser sur Termina.' },
  { number: 10, direction: 'across', start: 138, length: 6, text: 'Métropole australienne célèbre pour son opéra et ses Jeux olympiques.' },
  { number: 11, direction: 'down', start: 157, length: 9, text: 'Entreprise québécoise connue pour ses services de câble, de téléphonie et d’Internet.' },
  { number: 12, direction: 'down', start: 166, length: 9, text: 'Groupe québécois dont le chanteur Dédé Fortin est mort tragiquement.' },
  { number: 13, direction: 'across', start: 171, length: 8, text: 'Deuxième volet du jeu de Blizzard où des héros affrontent des démons.' },
  { number: 14, direction: 'down', start: 182, length: 8, text: 'Nom de famille du rocker québécois Éric, interprète de « Mon ange ».' },
  { number: 15, direction: 'across', start: 199, length: 10, text: 'Nom de famille d’Alphonse, fondateur du mouvement québécois de caisses populaires.' },
  { number: 16, direction: 'down', start: 238, length: 9, text: 'Film de Michel Jetté consacré au monde des gangs de motards.' },
  { number: 17, direction: 'across', start: 264, length: 9, text: 'Nom de Simon, médaillé d’or canadien en triathlon aux Jeux olympiques.' },
  { number: 18, direction: 'across', start: 274, length: 10, text: 'Nom du pilote allemand Michael, sept fois champion du monde de Formule 1.' },
  { number: 19, direction: 'down', start: 294, length: 9, text: 'Film de Denis Villeneuve dont l’histoire est racontée par un poisson.' },
  { number: 20, direction: 'down', start: 306, length: 7, text: 'Émission satirique animée par Jean-René Dufort.' },
  { number: 21, direction: 'across', start: 318, length: 6, text: 'Surnom de Maurice Richard, légendaire numéro 9 du Canadien.' },
  { number: 22, direction: 'down', start: 331, length: 8, text: 'Groupe médiatique québécois propriétaire de TVA et de Vidéotron.' },
  { number: 23, direction: 'across', start: 357, length: 10, text: 'Groupe derrière les chansons « One Step Closer » et « In the End ».' },
  { number: 24, direction: 'down', start: 359, length: 7, text: 'Service de partage de MP3 au cœur d’une poursuite intentée par Metallica.' },
  { number: 25, direction: 'across', start: 368, length: 7, text: 'Nom du chanteur québécois Daniel qui interprète « La désise ».' },
  { number: 26, direction: 'across', start: 405, length: 9, text: 'Groupe de Boom Desjardins derrière « Calvaire ».' },
  { number: 27, direction: 'across', start: 443, length: 7, text: 'Nom de famille de Pierre Elliott, ancien premier ministre canadien.' },
  { number: 28, direction: 'across', start: 473, length: 8, text: 'Avion de ligne supersonique franco-britannique au nez basculant.' },
];

export const CLUES = CLUE_DATA.map((clue) => ({
  ...clue,
  cells: Array.from(
    { length: clue.length },
    (_, index) => clue.start + index * (clue.direction === 'across' ? 1 : GRID_WIDTH),
  ),
}));
export type CrosswordClue = (typeof CLUES)[number];

const starts = new Map(CLUES.map((clue) => [clue.start, clue.number]));
export const CROSSWORD_CELLS = Array.from({ length: GRID_SIZE }, (_, index) => ({
  index,
  open: MASK[index] === '.',
  number: starts.get(index),
}));

export const EXTRACTION_CELLS = [321, 143, 77, 413, 368, 283, 245, 66, 175, 259, 157, 111, 360, 269] as const;
export const OPENING_CELLS = [0, 217, 218] as const;
export const NEIGHBORS = CROSSWORD_CELLS.map(({ index }) => {
  const row = Math.floor(index / GRID_WIDTH);
  const column = index % GRID_WIDTH;
  const neighbors: number[] = [];
  for (let y = Math.max(0, row - 1); y <= Math.min(row + 1, GRID_HEIGHT - 1); y++) {
    for (let x = Math.max(0, column - 1); x <= Math.min(column + 1, GRID_WIDTH - 1); x++) {
      const next = y * GRID_WIDTH + x;
      if (next !== index) neighbors.push(next);
    }
  }
  return neighbors;
});

const ADDITIONAL_MINES = [
  118, 119, 138, 139, 140, 141, 159, 160, 162, 183, 200, 202, 204, 216, 243, 326, 344,
] as const;

export const MINES: ReadonlySet<number> = new Set([
  ...EXTRACTION_CELLS.flatMap((cell) => NEIGHBORS[cell]),
  ...ADDITIONAL_MINES,
]);
export const MINE_COUNTS = NEIGHBORS.map((neighbors) =>
  neighbors.filter((cell) => MINES.has(cell)).length,
);
export const EXTRACTION_ORDERS: ReadonlyMap<number, number> = new Map(
  EXTRACTION_CELLS.map((cell, index) => [cell, index + 1]),
);

export type MineMark = 'hidden' | 'flagged' | 'clear' | 'hit';

export function openCell(marks: readonly MineMark[], cell: number): MineMark[] {
  const next = [...marks];
  const pending = [cell];
  while (pending.length) {
    const index = pending.pop()!;
    if (next[index] !== 'hidden') continue;
    if (MINES.has(index)) {
      next[index] = 'hit';
      break;
    }
    next[index] = 'clear';
    if (!MINE_COUNTS[index]) pending.push(...NEIGHBORS[index]);
  }
  return next;
}

export function initialMinefield(): MineMark[] {
  return OPENING_CELLS.reduce(
    (marks, cell) => openCell(marks, cell),
    Array<MineMark>(GRID_SIZE).fill('hidden'),
  );
}
