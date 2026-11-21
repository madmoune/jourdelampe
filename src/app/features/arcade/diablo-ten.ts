import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import {
  cryptBinary, cryptDistance, CRYPT_ATTACKS, CRYPT_DAMAGE, CRYPT_DAMAGE_TIME, CRYPT_HIT_TIME, CRYPT_HP, CRYPT_MANA,
  type CryptAction, GOLEM_HP, startCrypt, stepCrypt, toScreen,
} from './crypt';
import { ArcadeControls, Gamepad, HeldButtons, type GameInput } from './gamepad';

const FRAME_WIDTH = 110;
const FRAME_HEIGHT = 100;

@Component({
  selector: 'app-diablo-ten',
  imports: [ArcadeControls, Gamepad, NgTemplateOutlet],
  templateUrl: './diablo-ten.html',
  styleUrls: ['./arcade-controls.scss', './diablo-ten.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiabloTen {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly held = new HeldButtons();
  private frame: number | null = null;
  private lastTime = 0;
  private queued: CryptAction | null = null;
  protected readonly game = signal(startCrypt());
  protected readonly hero = computed(() => toScreen(this.game().hero));
  protected readonly golem = computed(() => toScreen(this.game().golem));
  protected readonly attacks = ['strike', 'spell'] as const;
  protected readonly pose = computed(() => {
    const { effect, effectTime } = this.game();
    if (!effect || !effectTime) return null;
    const attack = CRYPT_ATTACKS[effect];
    const age = attack.duration - effectTime;
    const frame = age < attack.release ? 0 : age < attack.release + 0.13 ? 1 : 2;
    return { effect, age, viewBox: `${frame * FRAME_WIDTH} 0 ${FRAME_WIDTH} ${FRAME_HEIGHT}` };
  });
  protected readonly projectile = computed(() => {
    const pose = this.pose();
    if (pose?.effect !== 'spell' || pose.age >= CRYPT_ATTACKS.spell.impact) return null;
    const { release, impact, reach } = CRYPT_ATTACKS.spell;
    const { facing, hero: player, golem: enemy } = this.game();
    const hero = this.hero();
    const charging = pose.age < release;
    const fromX = hero.x + facing * (charging ? 12 : 28);
    const fromY = hero.y - (charging ? 40 : 52);
    if (charging) return { x: fromX, y: fromY, radius: 2 + 3 * pose.age / release };
    const travel = (pose.age - release) / (impact - release);
    const distance = cryptDistance(player, enemy);
    const fraction = travel * Math.min(1, reach / Math.max(1, distance));
    const target = this.golem();
    return {
      x: fromX + (target.x - fromX) * fraction,
      y: fromY + (target.y - 31 - fromY) * fraction - Math.sin(Math.PI * travel) * 12,
      radius: 7 - 2 * travel,
    };
  });
  protected readonly impact = computed(() => {
    const remaining = this.game().hit / CRYPT_HIT_TIME;
    if (!remaining) return null;
    const golem = this.golem();
    return {
      opacity: remaining,
      transform: `translate(${golem.x} ${golem.y - 33}) scale(${1.55 - remaining})`,
    };
  });
  protected readonly damagePopup = computed(() => {
    const damage = this.game().damage;
    if (!damage) return null;
    const fraction = damage.remaining / CRYPT_DAMAGE_TIME;
    return {
      x: damage.at.x,
      y: Math.max(45, damage.at.y - 84),
      rise: -16 * (1 - fraction),
      opacity: Math.min(1, fraction * 4),
      code: cryptBinary(CRYPT_DAMAGE[damage.action], 8),
      spell: damage.action === 'spell',
    };
  });
  protected readonly animating = computed(() => {
    const { effectTime, hit, damage } = this.game();
    return effectTime > 0 || hit > 0 || damage !== null;
  });
  protected readonly walking = signal(false);
  protected readonly hpMax = CRYPT_HP;
  protected readonly manaMax = CRYPT_MANA;
  protected readonly enemyMax = GOLEM_HP;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected input(event: GameInput): void {
    this.held.update(event);
    if (!event.pressed || event.repeat) return;
    if (this.game().status !== 'playing') {
      if (event.key === 'a' && !this.animating()) this.restart();
      return;
    }
    if (event.key === 'a' || event.key === 'b') this.queued = event.key === 'a' ? 'strike' : 'spell';
    if (this.frame === null && this.browser) this.frame = this.browser.requestAnimationFrame(this.tick);
  }

  protected restart(): void {
    this.stop();
    this.game.set(startCrypt());
  }

  private readonly tick = (time: number): void => {
    this.frame = null;
    const [x, y] = this.held.axes();
    const action = this.queued ?? (this.held.has('a') ? 'strike' : this.held.has('b') ? 'spell' : null);
    const previous = this.game();
    const next = stepCrypt(previous, x, y, action, this.lastTime ? (time - this.lastTime) / 1000 : 1 / 60);
    this.queued = null;
    this.lastTime = time;
    this.walking.set(next.status === 'playing' && (next.hero.x !== previous.hero.x || next.hero.y !== previous.hero.y));
    this.game.set(next);
    if ((next.status === 'playing' || this.animating()) && this.browser) this.frame = this.browser.requestAnimationFrame(this.tick);
  };

  private stop(): void {
    if (this.frame !== null) this.browser?.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.lastTime = 0;
    this.queued = null;
    this.held.clear();
    this.walking.set(false);
  }
}
