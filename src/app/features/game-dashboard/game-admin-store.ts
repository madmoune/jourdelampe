import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from '../riddles/game-store';
import { parseSecrets, RiddleSecret } from '../riddles/game.model';
import { GameAdminSession } from './game-admin-session';

@Injectable()
export class GameAdminStore {
  readonly session = inject(GameAdminSession);
  readonly game = inject(GameStore);
  private readonly rest = inject(FirebaseRest);
  private readonly secretsState = signal<Record<string, RiddleSecret>>({});
  private readonly errorState = signal('');
  private readonly loadingState = signal(false);
  private subscription?: Subscription;
  readonly secrets = this.secretsState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.subscription?.unsubscribe();
      this.secretsState.set({});
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
    this.subscription = new Subscription(
      onValue(
        ref(database, 'riddleSecrets'),
        (snapshot) => {
          try {
            this.secretsState.set(parseSecrets(snapshot.val()));
            this.loadingState.set(false);
          } catch {
            this.unavailable();
          }
        },
        () => this.unavailable(),
      ),
    );
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
      },
      await this.session.token(),
    );
  }

  private unavailable(): void {
    this.secretsState.set({});
    this.loadingState.set(false);
    this.errorState.set('Les réponses sont indisponibles. Déconnecte-toi, puis réessaie.');
  }
}
