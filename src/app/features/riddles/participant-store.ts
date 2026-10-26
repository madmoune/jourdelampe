import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { of, Subscription, switchMap } from 'rxjs';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { parseParticipant, Participant, validateParticipantName } from './participant';

@Injectable({ providedIn: 'root' })
export class ParticipantStore {
  private readonly session = inject(AnonymousSession);
  private readonly database = inject(RealtimeDatabase);
  private readonly participantState = signal<Participant | null>(null);
  private readonly loadingState = signal(true);
  private readonly readyState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal('');
  private subscription?: Subscription;
  private uid: string | null = null;
  readonly participant = this.participantState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly canSolve = computed(() => this.readyState() && this.participant() !== null);

  constructor() {
    this.connect();
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  retry(): void {
    if (!this.saving()) this.connect();
  }

  async saveName(value: string): Promise<void> {
    const name = validateParticipantName(value);
    if (this.saving()) return;
    const previous = this.participant();
    this.savingState.set(true);
    try {
      const id = await this.session.signIn();
      const profile = { name, updatedAt: Date.now() };
      await this.database.update(`participants/${id}`, profile);
      // Les événements locaux Firebase peuvent précéder la confirmation du serveur.
      // L'accès demeure fermé jusqu'à la réussite de l'écriture.
      if (this.uid !== id) throw new Error('La session a changé.');
      this.participantState.set({ id, ...profile });
      this.readyState.set(true);
      this.errorState.set('');
    } catch {
      this.participantState.set(previous?.id === this.uid ? previous : null);
      throw new Error('Ton nom n’a pas pu être enregistré. Réessaie dans un instant.');
    } finally {
      this.savingState.set(false);
    }
  }

  /** À appeler aussi avant chaque future soumission de réponse. */
  requireParticipant(): Participant {
    const participant = this.participant();
    if (!this.canSolve() || !participant) {
      throw new Error('Entre et enregistre ton nom avant de répondre à une énigme.');
    }
    return participant;
  }

  private connect(): void {
    this.subscription?.unsubscribe();
    this.loadingState.set(true);
    this.readyState.set(false);
    this.errorState.set('');
    this.subscription = this.session
      .watch()
      .pipe(
        switchMap((uid) => {
          this.uid = uid;
          this.participantState.set(null);
          this.readyState.set(false);
          this.loadingState.set(true);
          return uid ? this.database.watch<unknown>(`participants/${uid}`) : of(null);
        }),
      )
      .subscribe({
        next: (value) => {
          try {
            const participant = this.uid ? parseParticipant(this.uid, value) : null;
            if (!this.saving()) this.participantState.set(participant);
            this.readyState.set(true);
            this.loadingState.set(false);
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
    this.loadingState.set(false);
    this.errorState.set('Ton profil est indisponible pour le moment. Réessaie la connexion.');
  }
}
