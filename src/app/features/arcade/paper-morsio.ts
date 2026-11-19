import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { COURSE_END, FINISH, GROUND, LEDGES, MARKERS, SCREEN_WIDTH, startMorsio, stepMorsio } from './platformer';
import { ArcadeControls, Gamepad, HeldButtons, type GameInput } from './gamepad';

@Component({
  selector: 'app-paper-morsio',
  imports: [ArcadeControls, Gamepad],
  templateUrl: './paper-morsio.html',
  styleUrls: ['./arcade-controls.scss', './paper-morsio.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperMorsio {
  private readonly browser = inject(DOCUMENT).defaultView;
  private frame: number | null = null;
  private lastTime = 0;
  private wantsJump = false;
  private readonly held = new HeldButtons();
  protected readonly ledges = LEDGES;
  protected readonly ground = GROUND;
  protected readonly markers = MARKERS;
  protected readonly finish = FINISH;
  protected readonly state = signal(startMorsio());
  private readonly cameraLimit = COURSE_END - SCREEN_WIDTH + 14;
  protected readonly camera = computed(() => Math.max(0, Math.min(this.cameraLimit, this.state().x - 155)));
  protected readonly parallax = computed(() => -14 * this.camera() / this.cameraLimit);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected input(event: GameInput): void {
    this.held.update(event);
    if (!event.pressed || event.repeat) return;
    if (event.key === 'b') {
      this.restart();
      return;
    }
    if (event.key === 'a' || event.key === 'up') this.wantsJump = true;
    this.start();
  }

  protected restart(): void {
    this.stop();
    this.state.set(startMorsio());
  }

  private start(): void {
    if (!this.browser || this.frame !== null || this.state().done) return;
    this.lastTime = 0;
    this.frame = this.browser.requestAnimationFrame(this.tick);
  }

  private readonly tick = (time: number): void => {
    this.frame = null;
    const [direction] = this.held.axes();
    const previous = this.state();
    const next = stepMorsio(previous, direction, this.wantsJump, this.lastTime ? (time - this.lastTime) / 1000 : 1 / 60);
    this.wantsJump = false;
    this.lastTime = time;
    this.state.set(next);
    if (!next.done && (direction || !next.grounded) && this.browser) {
      this.frame = this.browser.requestAnimationFrame(this.tick);
    }
  };

  private stop(): void {
    if (this.frame !== null) this.browser?.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.held.clear();
    this.wantsJump = false;
  }
}
