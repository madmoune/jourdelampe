import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GameTimePipe } from '../riddles/game-time.pipe';
import { GameMode } from '../riddles/game.model';
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
  protected readonly playerToRemove = signal<{ id: string; name: string } | null>(null);
  protected readonly syncState = computed<'live' | 'loading' | 'error'>(() => {
    if (this.store.error() || this.store.game.error()) return 'error';
    if (this.store.loading() || !this.store.game.ready()) return 'loading';
    return 'live';
  });
  private readonly resetPanel = viewChild<ElementRef<HTMLElement>>('resetPanel');
  private readonly removePlayerDialog =
    viewChild<ElementRef<HTMLDialogElement>>('removePlayerDialog');

  constructor() {
    afterRenderEffect(() => {
      if (this.resetStep()) this.resetPanel()?.nativeElement.focus({ preventScroll: true });
      const dialog = this.removePlayerDialog()?.nativeElement;
      if (this.playerToRemove() && dialog && !dialog.open) dialog.showModal();
      else if (!this.playerToRemove() && dialog?.open) dialog.close();
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

  protected async changeMode(mode: GameMode): Promise<void> {
    if (!this.store.game.ready() || this.store.game.mode() === mode) return;
    await this.perform(async () => {
      await this.store.setMode(mode);
      this.message.set(
        `Mode ${mode === 'team' ? 'en équipe' : 'individuel'} activé. Les réussites sont conservées.`,
      );
    });
  }

  protected cancelReset(): void {
    this.resetStep.set(0);
    this.resetText.set('');
  }

  protected startRemovePlayer(player: { id: string; name: string }): void {
    if (this.busy()) return;
    this.cancelReset();
    this.error.set('');
    this.message.set('');
    this.playerToRemove.set(player);
  }

  protected cancelRemovePlayer(): void {
    if (this.busy()) return;
    this.playerToRemove.set(null);
  }

  protected async confirmRemovePlayer(): Promise<void> {
    const player = this.playerToRemove();
    if (!player) return;
    await this.perform(async () => {
      await this.store.removePlayer(player.id);
      this.playerToRemove.set(null);
      this.message.set(`Le joueur ${player.name} a été supprimé.`);
    });
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
