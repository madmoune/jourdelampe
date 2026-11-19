export const TRAILS = [
  '##########',
  '#..#...B.#',
  '#..#.#...#',
  '#A...#...#',
  '#.##...#.#',
  '#.....#C.#',
  '##########',
] as const;

export type TrainerId = 'A' | 'B' | 'C';

export const CREATURES = {
  crinsauge: 'Crinsauge',
  flotillon: 'Flotillon',
  schistoc: 'Schistoc',
  sporastre: 'Sporastre',
  volticole: 'Volticole',
  frilievre: 'Frilièvre',
} as const;

type Creature = keyof typeof CREATURES;
type Slot = { creature: Creature; hp: number } | null;

export const TRAINERS = {
  A: {
    name: 'Dresseuse Sauge', order: 1, line: 'Mon équipe et moi, on te lance un défi !',
    slots: [{ creature: 'sporastre', hp: 8 }, null, { creature: 'frilievre', hp: 11 },
      { creature: 'crinsauge', hp: 16 }, null, null],
    attack: 3,
  },
  B: {
    name: 'Dresseur Orme', order: 2, line: 'Peux-tu encaisser le courant de Flotillon ?',
    slots: [null, { creature: 'volticole', hp: 8 }, { creature: 'sporastre', hp: 11 },
      { creature: 'flotillon', hp: 20 }, null, null],
    attack: 4,
  },
  C: {
    name: 'Dresseuse Mica', order: 3, line: 'Un dernier combat ? Schistoc est prêt !',
    slots: [{ creature: 'schistoc', hp: 23 }, null, null, null, null, null],
    attack: 5,
  },
} satisfies Record<TrainerId, {
  name: string;
  order: number;
  line: string;
  slots: readonly [Slot, Slot, Slot, Slot, Slot, Slot];
  attack: number;
}>;

export interface MapPoint { readonly x: number; readonly y: number; }
export const TRAIL_START: MapPoint = { x: 1, y: 1 };
export const TRAIL_KEYS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

export function stepTrail(point: MapPoint, dx: number, dy: number): MapPoint {
  const next = { x: point.x + dx, y: point.y + dy };
  return TRAILS[next.y]?.[next.x] === '.' ? next : point;
}

export function nearbyTrainer(point: MapPoint): TrainerId | null {
  for (const [dx, dy] of Object.values(TRAIL_KEYS)) {
    const tile = TRAILS[point.y + dy]?.[point.x + dx];
    if (tile === 'A' || tile === 'B' || tile === 'C') return tile;
  }
  return null;
}

export const CREATURE_HP = 32;
export const TRAIL_MOVES = ['Charge', 'Étincelle'] as const;

export interface TrailBattle {
  trainer: TrainerId;
  hp: number;
  active: number;
  enemy: number;
  sparks: number;
  message: string;
}

export function activeRival(battle: TrailBattle): NonNullable<Slot> {
  // The first turn and each replacement select only occupied slots.
  return TRAINERS[battle.trainer].slots[battle.active]!;
}

export function startTrailBattle(trainer: TrainerId): TrailBattle {
  const slots: readonly Slot[] = TRAINERS[trainer].slots;
  const active = slots.findIndex((slot) => slot !== null);
  return { trainer, hp: CREATURE_HP, active, enemy: slots[active]!.hp, sparks: 2, message: 'Braisillon, à toi !' };
}

export function hitTrainer(battle: TrailBattle, special: boolean): TrailBattle {
  if (!battle.hp || !battle.enemy || (special && !battle.sparks)) return battle;
  const damage = special ? 15 : 8;
  const enemy = Math.max(0, battle.enemy - damage);
  return {
    ...battle, enemy, sparks: battle.sparks - Number(special),
    message: `${TRAIL_MOVES[Number(special)]} ! −${battle.enemy - enemy} PV.`,
  };
}

export function finishTrainerTurn(battle: TrailBattle): TrailBattle {
  const rival = TRAINERS[battle.trainer];
  const name = CREATURES[activeRival(battle).creature];
  const slots: readonly Slot[] = rival.slots;
  const active = slots.findIndex((slot, index) => slot !== null && index > battle.active);
  if (!battle.enemy) {
    if (active === -1) return { ...battle, message: `${name} est K.O. Tu gagnes le combat !` };
    const next = slots[active]!;
    return {
      ...battle, active, enemy: next.hp,
      message: `${name} est K.O. ${CREATURES[next.creature]} entre en jeu !`,
    };
  }
  const retaliation = rival.attack + (active === -1 ? 3 : 0);
  const hp = Math.max(0, battle.hp - retaliation);
  return {
    ...battle, hp,
    message: !hp ? 'Braisillon est K.O. Appuie sur A pour retourner au sentier.' :
      `${battle.message} ${name} réplique : −${retaliation} PV.`,
  };
}
