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
  FOURCHETTE_GRID_VERSION,
  FOURCHETTE_WORD_COLUMNS,
  FOURCHETTE_WORDS,
  FourchetteProgress,
  parseFourchetteProgress,
  validFourchetteSelection,
} from './fourchette.model';

const GRID_CHECK_DEBOUNCE_MS = 300;
const GRID_CHECK_RETRY_DELAY_MS = 1000;
const MAX_GRID_CHECK_RETRIES = 2;

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
  protected readonly rowLabels = [...'ABCDE'];
  protected readonly columns = Array.from({ length: FOURCHETTE_GRID[0].length }, (_, index) =>
    String(index + 1).padStart(2, '0'),
  );
  protected readonly wordColumns = FOURCHETTE_WORD_COLUMNS;
  protected readonly wordCount = FOURCHETTE_WORDS.length;
  private readonly storageKey = computed(
    () =>
      `jdl-${FOURCHETTE_GRID_VERSION}:${this.participants.participant()?.id}:${this.game.round()?.id ?? 'preview'}`,
  );
  private readonly state = signal<{ key: string; progress: FourchetteProgress | null } | null>(
    null,
  );
  private readonly gridValidation = signal<{ key: string; code: string } | null>(null);
  private readonly verifiedCode = computed(
    () =>
      this.attempts
        .attempts()
        .find(
          (attempt) =>
            attempt.riddleId === FOURCHETTE_ID &&
            attempt.roundId === this.game.round()?.id &&
            attempt.kind === 'grid' &&
            attempt.target === FOURCHETTE_GRID_VERSION &&
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
  protected readonly validatedGridCode = computed(() => {
    const validation = this.gridValidation();
    return validation?.key === this.storageKey() ? validation.code : '';
  });
  protected readonly foundCount = computed(() => this.progress().found.length);
  protected readonly hasProgress = computed(
    () => this.progress().selection.includes('1') || this.foundCount() > 0,
  );
  protected readonly allFound = computed(() => this.foundCount() === this.wordCount);
  protected readonly checking = signal(false);
  protected readonly extractionReady = computed(() => {
    const code = this.validatedGridCode();
    const selection = this.progress().selection;
    return (
      this.allFound() &&
      code.length === selection.length &&
      code.split('').every((letter, index) => letter === '0' || selection[index] === '1')
    );
  });
  private readonly verdict = signal<{
    key: string;
    code: string;
    correct?: boolean;
    error?: string;
  } | null>(null);
  protected readonly currentVerdict = computed<{ correct?: boolean; error?: string } | null>(() => {
    if (!this.allFound()) return null;
    if (this.extractionReady()) return { correct: true };
    const result = this.verdict();
    const code = this.progress().selection;
    if (result?.key === this.storageKey() && result.code === code) return result;
    return this.verifiedCode() === code ? { correct: true } : null;
  });
  private requestId = 0;

  constructor() {
    effect(() => {
      const key = this.storageKey();
      const verifiedCode = this.verifiedCode();
      this.requestId++;
      this.checking.set(false);
      this.verdict.set(null);
      this.gridValidation.set(verifiedCode ? { key, code: verifiedCode } : null);
      this.state.set({ key, progress: this.readProgress(key) });
    });
    effect((onCleanup) => {
      const key = this.storageKey();
      const code = this.progress().selection;
      const eligible =
        this.allFound() && this.game.ready() && !!this.game.round() && !this.locked();
      const alreadyValid = this.extractionReady();
      const requestId = ++this.requestId;
      let timer: ReturnType<typeof setTimeout> | undefined;
      this.checking.set(false);
      onCleanup(() => {
        clearTimeout(timer);
        if (this.requestId === requestId) this.requestId++;
      });
      if (!eligible || alreadyValid) return;
      const check = (retry = 0): void => {
        void this.checkGrid(key, code, requestId).then((retryNeeded) => {
          if (retryNeeded && this.requestId === requestId && retry < MAX_GRID_CHECK_RETRIES)
            timer = setTimeout(() => check(retry + 1), GRID_CHECK_RETRY_DELAY_MS * (retry + 1));
        });
      };
      timer = setTimeout(() => check(), GRID_CHECK_DEBOUNCE_MS);
    });
  }

  protected toggleCell(index: number): void {
    if (this.locked()) return;
    if (this.extractionReady() && this.validatedGridCode()[index] === '1') return;
    const progress = this.progress();
    const code = progress.selection;
    if (!Number.isInteger(index) || index < 0 || index >= code.length) return;
    this.saveProgress({
      ...progress,
      selection: code.slice(0, index) + (code[index] === '1' ? '0' : '1') + code.slice(index + 1),
    });
  }

  protected toggleWord(word: string): void {
    if (this.locked() || this.extractionReady() || !FOURCHETTE_WORDS.includes(word)) return;
    const progress = this.progress();
    this.saveProgress({
      ...progress,
      found: progress.found.includes(word)
        ? progress.found.filter((entry) => entry !== word)
        : [...progress.found, word],
    });
  }

  protected clearGrid(): void {
    if (this.locked()) return;
    this.requestId++;
    this.checking.set(false);
    this.gridValidation.set(null);
    this.saveProgress(emptyFourchetteProgress());
  }

  private async checkGrid(key: string, code: string, requestId: number): Promise<boolean> {
    if (requestId !== this.requestId) return false;
    this.checking.set(true);
    this.verdict.set(null);
    try {
      const correct = await this.submissions.checkGrid(
        FOURCHETTE_ID,
        code,
        FOURCHETTE_GRID_VERSION,
      );
      if (
        this.requestId === requestId &&
        key === this.storageKey() &&
        code === this.progress().selection
      ) {
        if (correct) this.gridValidation.set({ key, code });
        this.verdict.set({ key, code, correct });
      }
    } catch {
      if (
        this.requestId === requestId &&
        key === this.storageKey() &&
        code === this.progress().selection
      ) {
        this.verdict.set({
          key,
          code,
          error: 'Validation de la grille momentanément indisponible.',
        });
        return true;
      }
    } finally {
      if (this.requestId === requestId) this.checking.set(false);
    }
    return false;
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
