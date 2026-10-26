import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import {
  GameRound,
  GameRiddle,
  GameSolutions,
  parseCatalog,
  parseRound,
  parseSolutions,
} from './game.model';

@Injectable({ providedIn: 'root' })
export class GameStore {
  private readonly database = inject(RealtimeDatabase);
  private readonly catalogState = signal<readonly GameRiddle[]>([]);
  private readonly roundState = signal<GameRound | null>(null);
  private readonly solutionsState = signal<GameSolutions>({});
  private readonly readyState = signal(false);
  private readonly errorState = signal('');
  readonly catalog = this.catalogState.asReadonly();
  readonly round = this.roundState.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly riddles = computed(() =>
    this.catalog().map((riddle) => ({
      ...riddle,
      solutions: Object.values(this.solutionsState()[riddle.id] ?? {})
        .filter((solution) => solution.roundId === this.round()?.id)
        .sort((a, b) => a.solvedAt - b.solvedAt || a.participantId.localeCompare(b.participantId)),
    })),
  );
  readonly solvedCount = computed(
    () => this.riddles().filter((riddle) => riddle.solutions.length > 0).length,
  );
  readonly metaUnlocked = computed(
    () => this.ready() && this.catalog().length > 0 && this.solvedCount() === this.catalog().length,
  );

  constructor() {
    combineLatest([
      this.database.watch<unknown>('game/catalog'),
      this.database.watch<unknown>('game/round'),
      this.database.watch<unknown>('game/solves'),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ([catalog, round, solutions]) => {
          try {
            this.catalogState.set(parseCatalog(catalog));
            this.roundState.set(parseRound(round));
            this.solutionsState.set(parseSolutions(solutions));
            this.readyState.set(true);
            this.errorState.set('');
          } catch {
            this.unavailable();
          }
        },
        error: () => this.unavailable(),
      });
  }

  private unavailable(): void {
    this.readyState.set(false);
    this.errorState.set('L’état du jeu est indisponible. Recharge la page pour réessayer.');
  }
}
