import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from '../riddles/game-store';
import { GameMode, parseSecrets, RiddleSecret } from '../riddles/game.model';
import { Participant } from '../riddles/participant';
import { GameAdminSession } from './game-admin-session';
import { parseParticipants, summarizePlayers } from './player-overview';

@Injectable()
export class GameAdminStore {
  readonly session = inject(GameAdminSession);
  readonly game = inject(GameStore);
  private readonly rest = inject(FirebaseRest);
  private readonly secretsState = signal<Record<string, RiddleSecret>>({});
  private readonly participantsState = signal<readonly Participant[]>([]);
  private readonly errorState = signal('');
  private readonly loadingState = signal(false);
  private subscription?: Subscription;
  readonly secrets = this.secretsState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly players = computed(() =>
    summarizePlayers(
      this.participantsState(),
      this.game.riddles(),
      this.game.mode(),
      this.game.ready(),
    ),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.subscription?.unsubscribe();
      this.secretsState.set({});
      this.participantsState.set([]);
      void this.session.logout().catch(() => {});
    });
  }

  async login(password: string): Promise<void> {
    await this.session.login(password);
    this.loadingState.set(true);
    this.errorState.set('');
    const { getDatabase, ref, onValue, runTransaction, serverTimestamp } =
      await import('firebase/database');
    const database = getDatabase(await this.session.getApp());
    this.subscription?.unsubscribe();
    const watch = (path: string) =>
      new Observable<unknown>((subscriber) =>
        onValue(
          ref(database, path),
          (snapshot) => subscriber.next(snapshot.val()),
          (error) => subscriber.error(error),
        ),
      );
    this.subscription = combineLatest([watch('riddleSecrets'), watch('participants')]).subscribe({
      next: ([secrets, participants]) => {
        try {
          const parsedSecrets = parseSecrets(secrets);
          const parsedParticipants = parseParticipants(participants);
          this.secretsState.set(parsedSecrets);
          this.participantsState.set(parsedParticipants);
          this.loadingState.set(false);
          this.errorState.set('');
        } catch {
          this.unavailable();
        }
      },
      error: () => this.unavailable(),
    });
    await runTransaction(
      ref(database, 'game/round'),
      (current) =>
        current === null ? { id: crypto.randomUUID(), resetAt: serverTimestamp() } : undefined,
      { applyLocally: false },
    );
  }

  async logout(): Promise<void> {
    this.subscription?.unsubscribe();
    this.secretsState.set({});
    this.participantsState.set([]);
    this.errorState.set('');
    await this.session.logout();
  }

  async reset(): Promise<void> {
    await this.rest.update(
      'game',
      {
        round: { id: crypto.randomUUID(), resetAt: { '.sv': 'timestamp' } },
        solves: null,
        proofs: null,
        attempts: null,
      },
      await this.session.token(),
    );
  }

  async setMode(mode: GameMode): Promise<void> {
    if (mode !== 'individual' && mode !== 'team') throw new Error('Mode de jeu invalide.');
    try {
      await this.rest.update('game/settings', { mode }, await this.session.token());
    } catch {
      throw new Error('Le mode n’a pas pu être enregistré. Réessaie dans un instant.');
    }
  }

  private unavailable(): void {
    this.secretsState.set({});
    this.participantsState.set([]);
    this.loadingState.set(false);
    this.errorState.set(
      'Les données de gestion sont indisponibles. Déconnecte-toi, puis réessaie.',
    );
  }
}
