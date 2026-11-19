export type CombatStatus = 'playing' | 'win' | 'loss';
export type PartyAction = 'strike' | 'spell';
export const PARTY_COMMANDS = [
  { id: 'strike', label: 'Attaquer', cost: 0 },
  { id: 'spell', label: 'Magie', cost: 2 },
] as const satisfies readonly { id: PartyAction; label: string; cost: number }[];

export const PARTY = [
  { name: 'Romaine', maxHp: 36, maxMp: 7 },
  { name: 'Croûton', maxHp: 42, maxMp: 5 },
] as const;
export const BOSS_NAME = 'VJW';
export const BOSS_HP = 81;
export const PARTY_DAMAGE = 9;

export interface PartyBattle {
  readonly hp: readonly number[];
  readonly mp: readonly number[];
  readonly enemy: number;
  readonly actor: number;
  readonly rounds: number;
  readonly status: CombatStatus;
  readonly message: string;
}

export function startParty(): PartyBattle {
  return {
    hp: PARTY.map((hero) => hero.maxHp),
    mp: PARTY.map((hero) => hero.maxMp),
    enemy: BOSS_HP,
    actor: 0,
    rounds: 0,
    status: 'playing',
    message: '',
  };
}

export interface PartyTurn {
  readonly hit: PartyBattle;
  readonly end: PartyBattle;
  readonly targets: readonly number[];
}

export function planPartyTurn(battle: PartyBattle, action: PartyAction): PartyTurn | null {
  if (battle.status !== 'playing') return null;
  const actor = PARTY[battle.actor];
  const cost = PARTY_COMMANDS.find((command) => command.id === action)!.cost;
  if (battle.mp[battle.actor] < cost) return null;
  const mp = battle.mp.map((energy, index) => energy - (index === battle.actor ? cost : 0));
  const enemy = Math.max(0, battle.enemy - PARTY_DAMAGE);
  const message = `${actor.name} inflige ${PARTY_DAMAGE} dégâts.`;
  const hit: PartyBattle = {
    ...battle, mp, enemy, status: enemy ? 'playing' : 'win', message: enemy ? message : `✓ ${message} Victoire !`,
  };
  if (!enemy) return { hit, end: hit, targets: [] };

  const nextHero = hit.hp.findIndex((health, index) => health > 0 && index > hit.actor);
  if (nextHero !== -1) return { hit, end: { ...hit, actor: nextHero }, targets: [] };

  const rounds = battle.rounds + 1;
  const wave = rounds % 2 === 0;
  const target = rounds % PARTY.length;
  const targets = hit.hp.flatMap((health, index) =>
    health && (wave || index === target || !hit.hp[target]) ? [index] : [],
  );
  const hp = hit.hp.map((health, index) => targets.includes(index) ? Math.max(0, health - PARTY_DAMAGE) : health);
  const nextActor = hp.findIndex(Boolean);
  return {
    hit,
    targets,
    end: {
      ...hit, hp, actor: Math.max(0, nextActor), rounds,
      status: nextActor === -1 ? 'loss' : 'playing',
      message: nextActor === -1 ? 'Défaite. Reforme ton équipe pour réessayer.' :
        `${message} ${BOSS_NAME} réplique et inflige ${PARTY_DAMAGE} dégâts ${targets.length > 1 ? 'à chacun' : 'à un héros'}.`,
    },
  };
}
