import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAnswer } from '../riddles/riddle-answer';
import { ZEBRA_ID } from '../riddles/riddle-pages';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { ZebraGrid } from './zebra-grid';
import { ZEBRA_ASSOCIATION_COUNT } from './zebra.model';

@Component({
  selector: 'app-zebra-play',
  imports: [ZebraGrid, RiddleAnswer],
  templateUrl: './zebra-play.html',
  styleUrl: './zebra-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZebraPlay {
  private readonly participants = inject(ParticipantStore);
  protected readonly game = inject(GameStore);
  private readonly submissions = inject(RiddleSubmissions);
  protected readonly riddleId = ZEBRA_ID;
  protected readonly totalAssociations = ZEBRA_ASSOCIATION_COUNT;
  protected readonly riddle = computed(() =>
    this.game.riddles().find((item) => item.id === ZEBRA_ID),
  );
  protected readonly storageKey = computed(
    () =>
      `jdl-zebra-v2:${this.participants.participant()?.id}:${this.game.round()?.id ?? 'preview'}`,
  );
  protected readonly gridState = signal<{ key: string; code: string | null } | null>(null);
  protected readonly gridCode = computed(() =>
    this.gridState()?.key === this.storageKey() ? (this.gridState()?.code ?? null) : null,
  );
  private requestId = 0;
  protected readonly verdict = signal<{
    code: string;
    key: string;
    correct?: boolean;
    error?: string;
  } | null>(null);
  protected readonly checking = signal(false);
  protected readonly currentVerdict = computed(() =>
    this.verdict()?.code === this.gridCode() && this.verdict()?.key === this.storageKey()
      ? this.verdict()
      : null,
  );
  protected readonly name = computed(() => this.participants.participant()?.name ?? '');

  constructor() {
    effect(() => {
      const code = this.gridCode();
      const key = this.storageKey();
      if (code && this.riddle()?.gridReady === true && this.game.ready())
        untracked(() => void this.checkGrid(code, key));
    });
  }
  protected retryGrid(): void {
    const code = this.gridCode();
    if (code) void this.checkGrid(code, this.storageKey());
  }
  private async checkGrid(code: string, key: string): Promise<void> {
    const requestId = ++this.requestId;
    this.checking.set(true);
    this.verdict.set(null);
    try {
      const correct = await this.submissions.checkGrid(ZEBRA_ID, code);
      if (requestId === this.requestId && this.storageKey() === key && this.gridCode() === code)
        this.verdict.set({ code, key, correct });
    } catch (error: unknown) {
      if (requestId === this.requestId && this.storageKey() === key && this.gridCode() === code)
        this.verdict.set({
          code,
          key,
          error: error instanceof Error ? error.message : 'Vérification indisponible.',
        });
    } finally {
      if (requestId === this.requestId) this.checking.set(false);
    }
  }
}
