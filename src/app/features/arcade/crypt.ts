import type { CombatStatus } from './combat';

interface Point { x: number; y: number; }
export type CryptAction = 'strike' | 'spell';
export const CRYPT_HP = 55;
export const CRYPT_MANA = 30;
export const GOLEM_HP = 384;
export const CRYPT_DAMAGE = { strike: 0b01000011, spell: 0b01001011 } as const;
export const CRYPT_ATTACKS = {
  strike: { duration: 0.38, release: 0.10, impact: 0.10, reach: 30, mana: 0 },
  spell: { duration: 0.58, release: 0.17, impact: 0.35, reach: 51, mana: 10 },
} as const;
export const CRYPT_HIT_TIME = 0.22;
export const CRYPT_DAMAGE_TIME = 1.05;

export function cryptBinary(value: number, bits = 0): string {
  return Math.floor(value).toString(2).padStart(bits, '0');
}

export interface CryptBattle {
  hero: Point;
  golem: Point;
  hp: number;
  mana: number;
  enemy: number;
  windup: number;
  recovery: number;
  hit: number;
  damage: { action: CryptAction; at: Point; remaining: number } | null;
  facing: number;
  effect: CryptAction | null;
  effectTime: number;
  status: CombatStatus;
  message: string;
}

export function startCrypt(): CryptBattle {
  return {
    hero: { x: 25, y: 77 }, golem: { x: 75, y: 28 },
    hp: CRYPT_HP, mana: CRYPT_MANA, enemy: GOLEM_HP, facing: 1,
    windup: 0, recovery: 0, hit: 0, damage: null, effect: null, effectTime: 0,
    status: 'playing', message: '',
  };
}

export function toScreen(point: Point): Point {
  return { x: 250 + (point.x - point.y) * 1.76, y: 97 + (point.x + point.y) * 0.60 };
}

function walk(point: Point, dx: number, dy: number, distance: number): Point {
  const length = Math.hypot(dx, dy);
  if (!length) return point;
  const clamp = (n: number) => Math.max(3, Math.min(97, n));
  return { x: clamp(point.x + dx / length * distance), y: clamp(point.y + dy / length * distance) };
}

export const cryptDistance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function stepCrypt(
  battle: CryptBattle, horizontal: number, vertical: number, action: CryptAction | null, elapsed: number,
): CryptBattle {
  const dt = Math.max(0, Math.min(0.05, elapsed));
  const effectTime = Math.max(0, battle.effectTime - dt);
  const hitTime = Math.max(0, battle.hit - dt);
  const remaining = (battle.damage?.remaining ?? 0) - dt;
  const damage = battle.damage && remaining > 0 ? { ...battle.damage, remaining } : null;
  if (battle.status !== 'playing') {
    return battle.effectTime || battle.hit || battle.damage ? { ...battle, effectTime, hit: hitTime, damage } : battle;
  }

  const movement = walk(battle.hero, vertical + horizontal, vertical - horizontal, 38 * dt);
  const next = {
    ...battle,
    hero: cryptDistance(movement, battle.golem) < Math.min(8, cryptDistance(battle.hero, battle.golem))
      ? battle.hero : movement,
    mana: Math.min(CRYPT_MANA, battle.mana + 4 * dt),
    recovery: Math.max(0, battle.recovery - dt),
    hit: hitTime,
    damage,
    effectTime,
  };
  if (battle.effect && battle.effectTime) {
    const attack = CRYPT_ATTACKS[battle.effect];
    const impactTime = attack.duration - attack.impact;
    if (battle.effectTime > impactTime && effectTime <= impactTime) {
      if (cryptDistance(next.hero, next.golem) <= attack.reach) {
        next.enemy = Math.max(0, next.enemy - CRYPT_DAMAGE[battle.effect]);
        next.hit = CRYPT_HIT_TIME;
        next.damage = { action: battle.effect, at: toScreen(next.golem), remaining: CRYPT_DAMAGE_TIME };
        next.message = battle.effect === 'spell' ? 'Le sort embrase le golem.' : 'La lame fend la pierre.';
        if (!next.enemy) return { ...next, status: 'win', message: 'Victoire ! Le golem s’effondre.' };
      } else {
        next.message = 'Hors de portée. Approche-toi du golem.';
      }
    }
  }
  if (!next.effectTime && horizontal) next.facing = Math.sign(horizontal);
  if (action && !next.effectTime) {
    const attack = CRYPT_ATTACKS[action];
    if (next.mana < attack.mana) {
      next.message = 'Mana insuffisant. Il se recharge pendant le combat.';
    } else {
      next.effect = action;
      next.effectTime = attack.duration;
      next.facing = Math.sign(toScreen(next.golem).x - toScreen(next.hero).x) || next.facing;
      next.mana -= attack.mana;
    }
  }
  if (battle.windup > 0) {
    next.windup = Math.max(0, battle.windup - dt);
    if (!next.windup) {
      next.recovery = 0.65;
      const hit = cryptDistance(next.hero, next.golem) <= 20;
      if (hit) next.hp = Math.max(0, next.hp - 12);
      next.message = hit ? 'Le golem t’atteint.' : 'Tu esquives le coup du golem.';
      if (!next.hp) return { ...next, effectTime: 0, hit: 0, status: 'loss', message: 'Défaite. Appuie sur A pour réessayer.' };
    }
  } else if (!next.recovery) {
    if (cryptDistance(next.hero, next.golem) <= 13) {
      next.windup = 0.64;
      next.message = 'Le golem lève le poing. Écarte-toi !';
    } else {
      next.golem = walk(next.golem, next.hero.x - next.golem.x, next.hero.y - next.golem.y, 21 * dt);
    }
  }
  return next;
}
