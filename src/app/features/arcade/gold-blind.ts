import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ArcadeControls, DIRECTIONS, Gamepad, type GameInput, isDirection } from './gamepad';
import {
  activeRival, CREATURES, CREATURE_HP, finishTrainerTurn, hitTrainer, nearbyTrainer, startTrailBattle, stepTrail, TRAIL_START,
  TRAIL_MOVES, TRAILS, TRAINERS, type TrainerId, type TrailBattle,
} from './trainer-map';

const ATTACKS = [
  { ready: 'charge-ready', launch: 'charge-lunge', impact: 'charge-impact', windupMs: 95, travelMs: 165 },
  { ready: 'spark-ready', launch: 'spark-release', impact: 'spark-impact', windupMs: 165, travelMs: 180 },
] as const;

type Attack = (typeof ATTACKS)[number];
type TurnPhase = Attack['ready' | 'launch' | 'impact'] | 'rival-lunge' | 'hero-impact';

@Component({
  selector: 'app-gold-blind',
  imports: [ArcadeControls, Gamepad],
  templateUrl: './gold-blind.html',
  styleUrls: ['./arcade-controls.scss', './gold-blind.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoldBlind {
  private turnTimer: ReturnType<typeof setTimeout> | undefined;
  protected readonly tiles = TRAILS.map((row) => [...row] as ('#' | '.' | TrainerId)[]);
  protected readonly trainers = TRAINERS;
  protected readonly moves = TRAIL_MOVES;
  protected readonly maxHp = CREATURE_HP;
  protected readonly creatures = CREATURES;
  protected readonly activeRival = activeRival;
  protected readonly position = signal(TRAIL_START);
  protected readonly facing = signal('down');
  protected readonly defeated = signal<ReadonlySet<TrainerId>>(new Set());
  protected readonly near = computed(() => nearbyTrainer(this.position()));
  protected readonly challenger = signal<TrainerId | null>(null);
  protected readonly battle = signal<TrailBattle | null>(null);
  protected readonly phase = signal<TurnPhase | null>(null);
  protected readonly attackPose = computed(() => {
    switch (this.phase()) {
      case 'charge-ready':
      case 'spark-ready': return '0 0 56 54';
      case 'charge-lunge':
      case 'charge-impact': return '56 0 56 54';
      case 'spark-release': return '112 0 56 54';
      default: return null;
    }
  });
  protected readonly rivalHit = computed(() => this.phase() === 'charge-impact' || this.phase() === 'spark-impact');
  protected readonly move = signal(0);
  protected readonly message = signal('');

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.turnTimer));
  }

  protected input(event: GameInput): void {
    if (!event.pressed || (event.repeat && !isDirection(event.key))) return;
    const battle = this.battle();
    if (battle) {
      const busy = !!this.phase();
      if (event.key === 'b' || (!busy && event.key === 'a' && (!battle.hp || !battle.enemy))) {
        clearTimeout(this.turnTimer);
        this.phase.set(null);
        this.battle.set(null);
        this.message.set(busy || (battle.hp && battle.enemy) ? 'Tu retournes au sentier sans finir le combat.' : battle.message);
      } else if (!busy && battle.hp && battle.enemy && !event.repeat) {
        if (event.key === 'a') this.attack(this.move());
        else if (isDirection(event.key)) this.move.set(event.key === 'left' || event.key === 'up' ? 0 : 1);
      }
      return;
    }
    const trainer = this.challenger();
    if (trainer) {
      if (event.key === 'a') {
        this.move.set(0);
        this.battle.set(startTrailBattle(trainer));
        this.challenger.set(null);
      } else if (event.key === 'b') {
        this.challenger.set(null);
      }
      return;
    }
    if (isDirection(event.key)) {
      const direction = DIRECTIONS[event.key];
      this.position.update((point) => stepTrail(point, ...direction));
      this.facing.set(event.key);
    } else if (event.key === 'a') {
      const near = this.near();
      if (near) {
        this.message.set('');
        this.challenger.set(near);
      }
    } else {
      this.message.set('Approche un dresseur et appuie sur A pour lui parler.');
    }
  }

  protected attack(choice: number): void {
    const previous = this.battle();
    if (!previous || this.phase()) return;
    this.move.set(choice);
    const hit = hitTrainer(previous, choice === 1);
    if (hit === previous) return;
    const attack = ATTACKS[choice];
    this.phase.set(attack.ready);
    this.battle.set({ ...previous, message: `Braisillon lance ${this.moves[choice]} !` });
    this.after(attack.windupMs, () => {
      this.phase.set(attack.launch);
      this.after(attack.travelMs, () => this.showImpact(attack, hit));
    });
  }

  private showImpact(attack: Attack, hit: TrailBattle): void {
    this.phase.set(attack.impact);
    this.battle.set(hit);
    this.after(180, () => {
      const next = finishTrainerTurn(hit);
      if (!hit.enemy) {
        this.finishTurn(next);
        return;
      }
      this.phase.set('rival-lunge');
      this.after(185, () => {
        this.phase.set('hero-impact');
        this.battle.set(next);
        this.after(180, () => this.finishTurn(next));
      });
    });
  }

  private finishTurn(next: TrailBattle): void {
    this.battle.set(next);
    this.phase.set(null);
    if (!next.enemy && !this.defeated().has(next.trainer)) {
      this.defeated.update((wins) => new Set([...wins, next.trainer]));
    }
  }

  private after(ms: number, next: () => void): void {
    this.turnTimer = setTimeout(() => {
      this.turnTimer = undefined;
      next();
    }, ms);
  }
}
