import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempts } from '../riddles/riddle-attempts';
import { FOURCHETTE_ID } from '../riddles/riddle-pages';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import {
  emptyFourchetteProgress,
  FOURCHETTE_GRID,
  FOURCHETTE_WORD_COLUMNS,
  FOURCHETTE_WORDS,
  FourchetteProgress,
  parseFourchetteProgress,
  validFourchetteSelection,
} from './fourchette.model';

@Component({
  selector: 'app-fourchette-play',
  templateUrl: './fourchette-play.html',
  styleUrl: './fourchette-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FourchettePlay {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly participants = inject(ParticipantStore);
  private readonly game = inject(GameStore);
  private readonly attempts = inject(RiddleAttempts);
  private readonly submissions = inject(RiddleSubmissions);
  protected readonly rows = FOURCHETTE_GRID.map((row) => [...row]);
  protected readonly columns = [...'ABCDEFGHIJK'];
  protected readonly wordColumns = FOURCHETTE_WORD_COLUMNS;
  protected readonly wordCount = FOURCHETTE_WORDS.length;
  private readonly storageKey = computed(
    () =>
      `jdl-fourchette-v1:${this.participants.participant()?.id}:${this.game.round()?.id ?? 'preview'}`,
  );
  private readonly state = signal<{ key: string; progress: FourchetteProgress | null } | null>(
    null,
  );
  private readonly verifiedCode = computed(
    () =>
      this.attempts
        .attempts()
        .find(
          (attempt) =>
            attempt.riddleId === FOURCHETTE_ID &&
            attempt.roundId === this.game.round()?.id &&
            attempt.kind === 'grid' &&
            attempt.correct &&
            validFourchetteSelection(attempt.answer),
        )?.answer ?? null,
  );
  protected readonly locked = computed(
    () =>
      this.game
        .riddles()
        .find((riddle) => riddle.id === FOURCHETTE_ID)
        ?.solutions.some(
          (solution) => solution.participantId === this.participants.participant()?.id,
        ) ?? false,
  );
  protected readonly progress = computed<FourchetteProgress>(() => {
    const code = this.verifiedCode();
    const local = this.state()?.key === this.storageKey() ? this.state()?.progress : null;
    if (code && (this.locked() || !local)) return { selection: code, found: FOURCHETTE_WORDS };
    return local ?? emptyFourchetteProgress();
  });
  protected readonly foundCount = computed(() => this.progress().found.length);
  protected readonly allFound = computed(() => this.foundCount() === this.wordCount);
  protected readonly checking = signal(false);
  protected readonly canVerify = computed(
    () =>
      this.allFound() &&
      this.game.ready() &&
      !!this.game.round() &&
      !this.locked() &&
      !this.checking(),
  );
  private readonly verdict = signal<{
    key: string;
    code: string;
    correct?: boolean;
    error?: string;
  } | null>(null);
  protected readonly currentVerdict = computed<{ correct?: boolean; error?: string } | null>(() => {
    if (!this.allFound()) return null;
    const result = this.verdict();
    const code = this.progress().selection;
    if (result?.key === this.storageKey() && result.code === code) return result;
    return this.verifiedCode() === code ? { correct: true } : null;
  });
  private requestId = 0;

  constructor() {
    effect(() => {
      const key = this.storageKey();
      this.requestId++;
      this.checking.set(false);
      this.verdict.set(null);
      this.state.set({ key, progress: this.readProgress(key) });
    });
  }

  protected toggleCell(index: number): void {
    if (this.locked()) return;
    const progress = this.progress();
    const code = progress.selection;
    if (!Number.isInteger(index) || index < 0 || index >= code.length) return;
    this.saveProgress({
      ...progress,
      selection: code.slice(0, index) + (code[index] === '1' ? '0' : '1') + code.slice(index + 1),
    });
  }

  protected toggleWord(word: string): void {
    if (this.locked() || !FOURCHETTE_WORDS.includes(word)) return;
    const progress = this.progress();
    this.saveProgress({
      ...progress,
      found: progress.found.includes(word)
        ? progress.found.filter((entry) => entry !== word)
        : [...progress.found, word],
    });
  }

  protected async verify(): Promise<void> {
    if (!this.canVerify()) return;
    const key = this.storageKey();
    const code = this.progress().selection;
    const requestId = ++this.requestId;
    this.checking.set(true);
    this.verdict.set(null);
    try {
      const correct = await this.submissions.checkGrid(FOURCHETTE_ID, code);
      if (
        this.requestId === requestId &&
        key === this.storageKey() &&
        code === this.progress().selection
      )
        this.verdict.set({ key, code, correct });
    } catch (error: unknown) {
      if (
        this.requestId === requestId &&
        key === this.storageKey() &&
        code === this.progress().selection
      )
        this.verdict.set({
          key,
          code,
          error:
            error instanceof Error
              ? error.message
              : 'Vérification indisponible. Réessaie dans un instant.',
        });
    } finally {
      if (this.requestId === requestId) this.checking.set(false);
    }
  }

  private saveProgress(progress: FourchetteProgress): void {
    const key = this.storageKey();
    this.verdict.set(null);
    this.state.set({ key, progress });
    try {
      this.browser?.localStorage.setItem(key, JSON.stringify(progress));
    } catch {
      /* Les sélections restent utilisables en mémoire. */
    }
  }

  private readProgress(key: string): FourchetteProgress | null {
    try {
      return parseFourchetteProgress(JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null'));
    } catch {
      return null;
    }
  }
}
