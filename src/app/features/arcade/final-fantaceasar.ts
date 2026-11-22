import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  BOSS_HP,
  BOSS_NAME,
  PARTY,
  PARTY_COMMANDS,
  PARTY_DAMAGE,
  type PartyAction,
  type PartyTurn,
  planPartyTurn,
  startParty,
} from './combat';
import { ArcadeControls, Gamepad, type GameInput } from './gamepad';

type Phase = 'attack' | 'boss-impact' | 'counter-ready' | 'counter-cast' | 'party-impact';

interface BattleAnimation {
  readonly phase: Phase;
  readonly command: PartyAction;
  readonly actor: number;
  readonly targets: readonly number[];
}

const ATTACK_MS = { strike: 280, spell: 330 };
const IMPACT_MS = 235;
const COUNTER_READY_MS = 155;
const COUNTER_CAST_MS = 225;

@Component({
  selector: 'app-final-fantaceasar',
  imports: [ArcadeControls, Gamepad],
  templateUrl: './final-fantaceasar.html',
  styleUrls: ['./arcade-controls.scss', './final-fantaceasar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalFantaceasar {
  private turnTimer: ReturnType<typeof setTimeout> | undefined;
  protected readonly party = PARTY;
  protected readonly commands = PARTY_COMMANDS;
  protected readonly battle = signal(startParty());
  protected readonly animation = signal<BattleAnimation | null>(null);
  protected readonly selected = signal(0);
  protected readonly enemyHp = BOSS_HP;
  protected readonly enemyName = BOSS_NAME;
  protected readonly damage = PARTY_DAMAGE;
  protected readonly boss = { x: 132, y: 171 };
  protected readonly heroes = [
    { x: 336, y: 185, width: 80, height: 112, sprite: 'romaine', handX: 32, handY: 64 },
    { x: 404, y: 220, width: 98, height: 97, sprite: 'crouton', handX: 47, handY: 76 },
  ] as const;
  protected readonly ended = computed(() => this.battle().status !== 'playing');
  protected readonly resultVisible = computed(() => this.ended() && !this.animation());
  protected readonly mana = computed(() => this.battle().mp[this.battle().actor]);
  protected readonly projectiles = computed(() => {
    const animation = this.animation();
    if (animation?.phase === 'attack' && animation.command === 'spell') {
      const hero = this.heroes[animation.actor];
      const from = { x: hero.x - hero.handX, y: hero.y - hero.handY };
      return [
        {
          ...from,
          dx: this.boss.x - from.x,
          dy: this.boss.y - 67 - from.y,
          counter: false,
        },
      ];
    }
    if (animation?.phase === 'counter-cast') {
      const from = { x: this.boss.x + 48, y: this.boss.y - 125 };
      return animation.targets.map((index) => {
        const hero = this.heroes[index];
        return { ...from, dx: hero.x - from.x, dy: hero.y - 56 - from.y, counter: true };
      });
    }
    return [];
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.turnTimer));
  }

  protected input(event: GameInput): void {
    if (!event.pressed || event.repeat || this.animation()) return;
    if (this.ended()) {
      if (event.key === 'a') this.restart();
      return;
    }
    switch (event.key) {
      case 'a':
        this.act(this.selected());
        break;
      case 'b':
        this.selected.set(0);
        break;
      case 'up':
      case 'left':
      case 'down':
      case 'right':
        this.selected.set(this.selected() === 0 && this.mana() >= this.commands[1].cost ? 1 : 0);
        break;
    }
  }

  protected act(choice: number): void {
    if (this.animation()) return;
    const previous = this.battle();
    const command = this.commands[choice].id;
    const turn = planPartyTurn(previous, command);
    if (!turn) return;
    const cue: BattleAnimation = {
      phase: 'attack',
      command,
      actor: previous.actor,
      targets: turn.targets,
    };
    this.selected.set(choice);
    this.animation.set(cue);
    this.battle.set({
      ...previous,
      message: `${this.party[previous.actor].name} ${command === 'strike' ? 'attaque' : 'lance un sort'} !`,
    });
    this.after(ATTACK_MS[command], () => this.showImpact(turn, cue));
  }

  protected restart(): void {
    clearTimeout(this.turnTimer);
    this.animation.set(null);
    this.battle.set(startParty());
    this.selected.set(0);
  }

  private showImpact(turn: PartyTurn, cue: BattleAnimation): void {
    this.battle.set(turn.hit);
    this.animation.set({ ...cue, phase: 'boss-impact' });
    this.after(IMPACT_MS, () => {
      if (!turn.targets.length) {
        this.finishTurn(turn);
        return;
      }
      this.battle.set({ ...turn.hit, message: `${this.enemyName} prépare sa riposte.` });
      this.animation.set({ ...cue, phase: 'counter-ready' });
      this.after(COUNTER_READY_MS, () => {
        this.animation.set({ ...cue, phase: 'counter-cast' });
        this.after(COUNTER_CAST_MS, () => {
          this.battle.set(turn.end);
          this.animation.set({ ...cue, phase: 'party-impact' });
          this.after(IMPACT_MS, () => this.finishTurn(turn));
        });
      });
    });
  }

  private finishTurn(turn: PartyTurn): void {
    this.battle.set(turn.end);
    this.animation.set(null);
    if (this.commands[this.selected()].cost > this.mana()) this.selected.set(0);
  }

  private after(ms: number, next: () => void): void {
    this.turnTimer = setTimeout(() => {
      this.turnTimer = undefined;
      next();
    }, ms);
  }
}
