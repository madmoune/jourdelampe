import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { ParticipantStore } from './participant-store';

export interface RiddleAttempt {
  readonly id: string;
  readonly riddleId: string;
  readonly participantName: string;
  readonly kind: 'answer' | 'grid';
  readonly answer: string;
  readonly correct: boolean;
  readonly roundId: string;
  readonly submittedAt: number;
}

function parseAttempts(raw: unknown): readonly RiddleAttempt[] {
  if (raw === null) return [];
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Historique invalide.');
  const attempts: RiddleAttempt[] = [];
  for (const [riddleId, entries] of Object.entries(raw)) {
    if (!entries || typeof entries !== 'object' || Array.isArray(entries))
      throw new Error('Historique invalide.');
    for (const [id, entry] of Object.entries(entries)) {
      if (!entry || typeof entry !== 'object') throw new Error('Historique invalide.');
      const item = entry as Record<string, unknown>;
      if (
        typeof item['answer'] !== 'string' ||
        typeof item['participantName'] !== 'string' ||
        !['answer', 'grid'].includes(item['kind'] as string) ||
        typeof item['correct'] !== 'boolean' ||
        typeof item['roundId'] !== 'string' ||
        typeof item['submittedAt'] !== 'number' ||
        !Number.isFinite(item['submittedAt'])
      )
        throw new Error('Historique invalide.');
      attempts.push({ ...item, id, riddleId } as unknown as RiddleAttempt);
    }
  }
  return attempts.sort((a, b) => b.submittedAt - a.submittedAt || a.id.localeCompare(b.id));
}

@Injectable({ providedIn: 'root' })
export class RiddleAttempts {
  private readonly database = inject(RealtimeDatabase);
  private readonly participants = inject(ParticipantStore);
  private readonly participantId = computed(() => this.participants.participant()?.id ?? null);
  private readonly state = signal<{
    uid: string | null;
    attempts: readonly RiddleAttempt[];
    error: string;
    ready: boolean;
  }>({ uid: null, attempts: [], error: '', ready: false });
  readonly attempts = computed(() =>
    this.state().uid === this.participantId() ? this.state().attempts : [],
  );
  readonly ready = computed(() => this.state().uid === this.participantId() && this.state().ready);
  readonly error = computed(() =>
    this.state().uid === this.participantId() ? this.state().error : '',
  );

  constructor() {
    toObservable(this.participantId)
      .pipe(
        switchMap((uid) =>
          uid
            ? this.database.watch<unknown>(`game/attempts/${uid}`).pipe(
                map((raw) => ({ uid, attempts: parseAttempts(raw), error: '', ready: true })),
                catchError(() =>
                  of({
                    uid,
                    attempts: [],
                    error: 'L’historique est indisponible. Recharge la page pour réessayer.',
                    ready: false,
                  }),
                ),
              )
            : of({ uid: null, attempts: [], error: '', ready: false }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }
}
