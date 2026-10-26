import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GameTimePipe } from '../riddles/game-time.pipe';
import { GameAdminSession } from './game-admin-session';
import { GameAdminStore } from './game-admin-store';

@Component({
  selector: 'app-game-dashboard',
  imports: [FormsModule, RouterLink, GameTimePipe],
  providers: [GameAdminSession, GameAdminStore],
  templateUrl: './game-dashboard.html',
  styleUrl: './game-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-nosnippet]': 'true' },
})
export class GameDashboard {
  protected readonly store = inject(GameAdminStore);
  protected readonly password = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected readonly resetStep = signal<0 | 1 | 2>(0);
  protected readonly resetText = signal('');
  private readonly resetPanel = viewChild<ElementRef<HTMLElement>>('resetPanel');

  constructor() {
    afterRenderEffect(() => {
      this.resetStep();
      this.resetPanel()?.nativeElement.focus({ preventScroll: true });
    });
  }

  protected async login(): Promise<void> {
    await this.perform(async () => {
      await this.store.login(this.password());
      this.password.set('');
    });
  }

  protected async logout(): Promise<void> {
    await this.perform(async () => {
      await this.store.logout();
      this.cancelReset();
    });
  }

  protected startReset(): void {
    if (this.busy()) return;
    this.error.set('');
    this.message.set('');
    this.resetText.set('');
    this.resetStep.set(1);
  }

  protected cancelReset(): void {
    this.resetStep.set(0);
    this.resetText.set('');
  }

  protected async confirmReset(): Promise<void> {
    if (this.resetStep() !== 2 || this.resetText().trim() !== 'RÉINITIALISER') return;
    await this.perform(async () => {
      await this.store.reset();
      this.cancelReset();
      this.message.set(
        'Le jeu a été réinitialisé. Toutes les énigmes sont à nouveau non résolues.',
      );
    });
  }

  private async perform(action: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      await action();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'L’opération a échoué. Réessaie.');
    } finally {
      this.busy.set(false);
    }
  }
}
