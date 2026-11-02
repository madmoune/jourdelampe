import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempts } from '../riddles/riddle-attempts';
import { ZEBRA_ID } from '../riddles/riddle-pages';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { ZebraGrid } from './zebra-grid';
import {
  decodeCompleteGrid,
  ZEBRA_ASSOCIATION_COUNT,
  ZEBRA_NAME_TARGETS,
  type ZebraNameTarget,
} from './zebra.model';

interface SurnameCheck {
  readonly code: string;
  readonly key: string;
  readonly value: string;
  readonly checking: boolean;
  readonly correct?: boolean;
  readonly error?: string;
}

interface ZebraCompletion {
  readonly gridCode?: string;
  readonly surnames?: Partial<Record<ZebraNameTarget, string>>;
}

const SURNAME_CHECK_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-zebra-play',
  imports: [ZebraGrid],
  templateUrl: './zebra-play.html',
  styleUrl: './zebra-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZebraPlay {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly participants = inject(ParticipantStore);
  protected readonly game = inject(GameStore);
  private readonly attempts = inject(RiddleAttempts);
  private readonly submissions = inject(RiddleSubmissions);
  protected readonly totalAssociations = ZEBRA_ASSOCIATION_COUNT;
  protected readonly surnameTargets = ZEBRA_NAME_TARGETS;
  protected readonly riddle = computed(() =>
    this.game.riddles().find((item) => item.id === ZEBRA_ID),
  );
  protected readonly storageKey = computed(
    () =>
      `jdl-zebra-v2:${this.participants.participant()?.id}:${this.game.round()?.id ?? 'preview'}`,
  );
  private readonly completionKey = computed(() => `${this.storageKey()}:completion`);
  private readonly completionState = signal<{ key: string; value: ZebraCompletion }>({
    key: '',
    value: {},
  });
  protected readonly storedCompletion = computed(() => {
    const state = this.completionState();
    return state.key === this.completionKey() ? state.value : null;
  });
  protected readonly completion = computed<ZebraCompletion>(() => {
    const local = this.storedCompletion() ?? {};
    const roundId = this.game.round()?.id;
    const attempts = this.attempts
      .attempts()
      .filter(
        (attempt) =>
          attempt.riddleId === ZEBRA_ID && attempt.roundId === roundId && attempt.correct,
      );
    const gridCode = attempts.find((attempt) => attempt.kind === 'grid')?.answer;
    const surnames: Partial<Record<ZebraNameTarget, string>> = {};
    for (const attempt of attempts) {
      if (attempt.kind === 'surname' && attempt.target)
        surnames[attempt.target as ZebraNameTarget] = attempt.answer;
    }
    return {
      ...(gridCode || local.gridCode ? { gridCode: local.gridCode ?? gridCode } : {}),
      ...((Object.keys(surnames).length || local.surnames) && {
        surnames: { ...surnames, ...local.surnames },
      }),
    };
  });
  protected readonly gridState = signal<{ key: string; code: string | null } | null>(null);
  protected readonly gridCode = computed(() =>
    this.gridState()?.key === this.storageKey()
      ? (this.gridState()?.code ?? null)
      : (this.completion()?.gridCode ?? null),
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
  protected readonly solved = computed(
    () =>
      this.riddle()?.solutions.some(
        (solution) => solution.participantId === this.participants.participant()?.id,
      ) ?? false,
  );
  private readonly surnameDrafts = signal<Partial<Record<ZebraNameTarget, string>>>({});
  private readonly surnameChecks = signal<Partial<Record<ZebraNameTarget, SurnameCheck>>>({});
  private readonly surnameRequestIds = new Map<ZebraNameTarget, number>();
  private readonly surnameTimers = new Map<ZebraNameTarget, ReturnType<typeof setTimeout>>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const timer of this.surnameTimers.values()) clearTimeout(timer);
      this.surnameTimers.clear();
    });
    effect(() => {
      const key = this.completionKey();
      this.completionState.set({ key, value: this.readCompletion(key) });
    });
    effect(() => {
      const code = this.gridCode();
      const key = this.storageKey();
      if (code && this.game.ready()) untracked(() => void this.checkGrid(code, key));
    });
  }
  protected retryGrid(): void {
    const code = this.gridCode();
    if (code) void this.checkGrid(code, this.storageKey());
  }
  protected surnameDraft(target: ZebraNameTarget): string {
    return this.surnameDrafts()[target] ?? this.completion()?.surnames?.[target] ?? '';
  }
  protected updateSurname(target: ZebraNameTarget, value: string): void {
    if (this.surnameResult(target)?.correct) return;
    const timer = this.surnameTimers.get(target);
    if (timer !== undefined) clearTimeout(timer);
    this.surnameTimers.delete(target);
    this.surnameRequestIds.set(target, (this.surnameRequestIds.get(target) ?? 0) + 1);
    this.surnameDrafts.update((current) => ({ ...current, [target]: value }));
    this.surnameChecks.update((current) => {
      if (!current[target]) return current;
      const next = { ...current };
      delete next[target];
      return next;
    });
    if (value.trim()) {
      this.surnameTimers.set(
        target,
        setTimeout(() => {
          this.surnameTimers.delete(target);
          void this.verifySurname(target);
        }, SURNAME_CHECK_DEBOUNCE_MS),
      );
    }
  }
  protected surnameResult(target: ZebraNameTarget): SurnameCheck | null {
    const result = this.surnameChecks()[target];
    const code = this.gridCode();
    const key = this.storageKey();
    if (result && code && result.code === code && result.key === key) return result;
    const stored = this.completion()?.surnames?.[target];
    return stored && code ? { code, key, value: stored, checking: false, correct: true } : null;
  }
  protected async verifySurname(target: ZebraNameTarget): Promise<void> {
    const value = this.surnameDraft(target).trim();
    const code = this.gridCode();
    const key = this.storageKey();
    if (!value || !code || !this.currentVerdict()?.correct) return;
    const requestId = this.surnameRequestIds.get(target) ?? 0;
    this.surnameChecks.update((current) => ({
      ...current,
      [target]: { code, key, value, checking: true },
    }));
    try {
      const correct = await this.submissions.checkSurname(ZEBRA_ID, target, value);
      if (
        requestId === (this.surnameRequestIds.get(target) ?? 0) &&
        this.gridCode() === code &&
        this.storageKey() === key &&
        this.surnameDraft(target).trim() === value
      )
        this.surnameChecks.update((current) => ({
          ...current,
          [target]: { code, key, value, checking: false, correct },
        }));
      if (correct)
        this.saveCompletion({
          surnames: { ...(this.storedCompletion()?.surnames ?? {}), [target]: value },
        });
    } catch (error: unknown) {
      if (
        requestId === (this.surnameRequestIds.get(target) ?? 0) &&
        this.gridCode() === code &&
        this.storageKey() === key &&
        this.surnameDraft(target).trim() === value
      )
        this.surnameChecks.update((current) => ({
          ...current,
          [target]: {
            code,
            key,
            value,
            checking: false,
            error: error instanceof Error ? error.message : 'Vérification indisponible.',
          },
        }));
    }
  }
  private async checkGrid(code: string, key: string): Promise<void> {
    const requestId = ++this.requestId;
    this.checking.set(true);
    this.verdict.set(null);
    try {
      const correct = await this.submissions.checkGrid(ZEBRA_ID, code);
      if (requestId === this.requestId && this.storageKey() === key && this.gridCode() === code) {
        this.verdict.set({ code, key, correct });
        if (correct) this.saveCompletion({ gridCode: code });
      }
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

  protected gridCompleted(state: { key: string; code: string | null }): void {
    this.gridState.set(state);
    const storedCode = this.completion()?.gridCode;
    if (!this.solved() && storedCode && storedCode !== state.code) this.clearCompletion();
  }

  private saveCompletion(patch: Partial<ZebraCompletion>): void {
    const key = this.completionKey();
    const value = { ...(this.storedCompletion() ?? {}), ...patch };
    try {
      this.browser?.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Mémoire de la page seulement. */
    }
    this.completionState.set({ key, value });
  }

  private clearCompletion(): void {
    const key = this.completionKey();
    try {
      this.browser?.localStorage.removeItem(key);
    } catch {
      /* Mémoire de la page seulement. */
    }
    this.completionState.set({ key, value: {} });
  }

  private readCompletion(key: string): ZebraCompletion {
    try {
      const raw = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null') as Record<
        string,
        unknown
      > | null;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
      const gridCode =
        typeof raw['gridCode'] === 'string' && decodeCompleteGrid(raw['gridCode'])
          ? raw['gridCode']
          : undefined;
      const rawSurnames = raw['surnames'];
      const surnames: Partial<Record<ZebraNameTarget, string>> = {};
      if (rawSurnames && typeof rawSurnames === 'object' && !Array.isArray(rawSurnames)) {
        for (const target of this.surnameTargets) {
          const value = (rawSurnames as Record<string, unknown>)[target.id];
          if (typeof value === 'string' && value.trim()) surnames[target.id] = value;
        }
      }
      return {
        ...(gridCode ? { gridCode } : {}),
        ...(Object.keys(surnames).length ? { surnames } : {}),
      };
    } catch {
      return {};
    }
  }
}
