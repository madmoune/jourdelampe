import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from '../riddles/game-store';
import {
  gameId,
  GameMode,
  GameRiddle,
  parseSecrets,
  RiddleSecret,
  RiddleSolution,
} from '../riddles/game.model';
import { Participant } from '../riddles/participant';
import {
  ARCADE_ID,
  FOURCHETTE_ID,
  MANCHETTES_ID,
  MATCHMAKER_ID,
  META_ID,
  PIGPEN_ID,
  RIDDLE_COUNT,
  RIDDLE_PAGES,
  SENS_DESSUS_DESSOUS_ID,
  SUDOKU_ID,
  ZEBRA_ID,
  ZEBRA_TITLE,
} from '../riddles/riddle-pages';
import { GameAdminSession } from './game-admin-session';
import { parseParticipants, summarizePlayers } from './player-overview';

type ProgressRiddle = GameRiddle & { readonly solutions: readonly RiddleSolution[] };
type DashboardRiddle = ProgressRiddle & { readonly configured: boolean };

const FALLBACK_RIDDLES: readonly GameRiddle[] = [
  { id: ZEBRA_ID, title: ZEBRA_TITLE, prompt: '', order: 0 },
  { id: FOURCHETTE_ID, title: 'La Fourchette', prompt: '', order: 1 },
  { id: MATCHMAKER_ID, title: 'Le début de la fin', prompt: 'À venir', order: 2 },
  {
    id: PIGPEN_ID,
    title: 'La porcherie',
    prompt:
      'Sept enclos à remplir. Aperçu des grilles; la réponse finale n’est pas encore configurée.',
    order: 3,
  },
  {
    id: SUDOKU_ID,
    title: 'Sudoquoi?',
    prompt: 'Un sudoku et neuf poses à déchiffrer. Aperçu du dossier.',
    order: 4,
  },
  {
    id: MANCHETTES_ID,
    title: 'Crossword Démineur (ne jamais oublier le word)',
    prompt: 'Des mots croisés et un terrain miné. Aperçu du dossier.',
    order: 5,
  },
  {
    id: ARCADE_ID,
    title: 'Arcade',
    prompt: 'Quatre jeux, quatre objectifs. Aperçu du dossier.',
    order: 6,
  },
  {
    id: SENS_DESSUS_DESSOUS_ID,
    title: RIDDLE_PAGES[SENS_DESSUS_DESSOUS_ID].title,
    prompt: 'À venir',
    order: 7,
  },
];

const FALLBACK_IDS = new Set(FALLBACK_RIDDLES.map((riddle) => riddle.id));

function completeDashboardRiddles(riddles: readonly ProgressRiddle[]): readonly DashboardRiddle[] {
  const liveById = new Map(riddles.map((riddle) => [riddle.id, riddle]));
  const completed = FALLBACK_RIDDLES.map((fallback) => {
    const live = liveById.get(fallback.id);
    return live
      ? { ...live, title: live.id === ZEBRA_ID ? ZEBRA_TITLE : live.title, configured: true }
      : { ...fallback, solutions: [], configured: false };
  });
  for (const riddle of riddles) {
    if (!FALLBACK_IDS.has(riddle.id)) completed.push({ ...riddle, configured: true });
  }
  return completed.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

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
  readonly riddles = computed(() => completeDashboardRiddles(this.game.riddles()));
  private readonly regularRiddles = computed(() =>
    this.riddles().filter((riddle) => riddle.id !== META_ID),
  );
  readonly riddleCount = computed(() => this.regularRiddles().length);
  readonly solvedCount = computed(
    () => this.regularRiddles().filter((riddle) => riddle.solutions.length > 0).length,
  );
  readonly teamMetaUnlocked = computed(
    () =>
      this.game.ready() &&
      this.riddleCount() >= RIDDLE_COUNT &&
      this.regularRiddles().every((riddle) => riddle.solutions.length > 0),
  );
  readonly individualMetaCount = computed(() => {
    const riddles = this.regularRiddles();
    if (!this.game.ready() || riddles.length < RIDDLE_COUNT) return 0;
    return riddles[0].solutions.filter((solution) =>
      riddles.every((riddle) =>
        riddle.solutions.some((entry) => entry.participantId === solution.participantId),
      ),
    ).length;
  });
  readonly players = computed(() =>
    summarizePlayers(this.participantsState(), this.riddles(), this.game.mode(), this.game.ready()),
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

  async removePlayer(participantId: string): Promise<void> {
    if (!gameId(participantId)) throw new Error('Joueur invalide.');
    const patch: Record<string, unknown> = {
      [`participants/${participantId}`]: null,
      [`game/proofs/${participantId}`]: null,
      [`game/attempts/${participantId}`]: null,
    };
    for (const riddle of this.game.catalog())
      patch[`game/solves/${riddle.id}/${participantId}`] = null;
    try {
      await this.rest.update('', patch, await this.session.token());
      this.participantsState.update((participants) =>
        participants.filter((participant) => participant.id !== participantId),
      );
    } catch {
      throw new Error('Le joueur n’a pas pu être supprimé. Réessaie dans un instant.');
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
