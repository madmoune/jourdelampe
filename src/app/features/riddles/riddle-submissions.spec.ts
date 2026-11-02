import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { DatabaseWriteError, FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleSubmissions } from './riddle-submissions';
import { GameRiddle, RiddleSolution } from './game.model';

describe('validation et historique des réponses', () => {
  let update: ReturnType<typeof vi.fn>;
  let requireParticipant: ReturnType<typeof vi.fn>;
  let submissions: RiddleSubmissions;
  let riddles: WritableSignal<(GameRiddle & { solutions: RiddleSolution[] })[]>;
  beforeEach(() => {
    update = vi.fn().mockResolvedValue(undefined);
    requireParticipant = vi.fn(() => ({ id: 'alice', name: 'Alice Roy' }));
    riddles = signal([
      {
        id: 'a',
        title: 'La lampe',
        prompt: '',
        order: 0,
        gridReady: true,
        answerReady: false,
        solutions: [],
      },
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseRest, useValue: { update } },
        { provide: AnonymousSession, useValue: { token: async () => 'test-token' } },
        { provide: ParticipantStore, useValue: { requireParticipant } },
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            round: signal({ id: 'one', resetAt: 1 }),
            riddles,
          },
        },
      ],
    });
    submissions = TestBed.inject(RiddleSubmissions);
  });
  it('enregistre la bonne réponse, sa preuve et la résolution atomiquement avec l’heure serveur', async () => {
    update.mockRejectedValueOnce(new DatabaseWriteError(401));
    expect(await submissions.submit('a', '  é-clair! ')).toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
    const [path, patch, token] = update.mock.calls[1];
    expect(path).toBe('game');
    expect(token).toBe('test-token');
    expect(patch['solves/a/alice']).toEqual({
      participantId: 'alice',
      participantName: 'Alice Roy',
      riddleId: 'a',
      riddleTitle: 'La lampe',
      roundId: 'one',
      solvedAt: { '.sv': 'timestamp' },
    });
    expect(patch['proofs/alice/a']).toEqual({ answer: 'ECLAIR', roundId: 'one' });
    expect(Object.entries(patch).find(([key]) => key.startsWith('attempts/'))?.[1]).toEqual({
      answer: 'é-clair!',
      normalizedAnswer: 'ECLAIR',
      correct: true,
      kind: 'answer',
      participantName: 'Alice Roy',
      roundId: 'one',
      submittedAt: { '.sv': 'timestamp' },
    });
    const attemptPath = Object.keys(patch).find((key) => key.startsWith('attempts/'))!;
    expect(update.mock.calls[0][1]).toEqual({
      [attemptPath]: { ...patch[attemptPath], correct: false },
    });
  });
  it('valide et enregistre une mauvaise réponse en un seul appel, sans tentative de résolution', async () => {
    expect(await submissions.submit('a', 'Faux')).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
    const patch = update.mock.calls[0][1];
    expect(Object.keys(patch)).toHaveLength(1);
    expect(Object.values(patch)[0]).toEqual(
      expect.objectContaining({ answer: 'Faux', correct: false, kind: 'answer' }),
    );
  });
  it('ne confond pas une panne réseau ou un refus d’accès avec une réponse incorrecte', async () => {
    update.mockRejectedValue(new DatabaseWriteError(503));
    await expect(submissions.submit('a', 'Réponse')).rejects.toThrow('n’a pas pu être vérifiée');
    expect(update).toHaveBeenCalledTimes(1);
    update.mockReset().mockRejectedValue(new DatabaseWriteError(401));
    await expect(submissions.submit('a', 'Réponse')).rejects.toThrow(
      'La validation de cette énigme n’est pas configurée',
    );
    expect(update).toHaveBeenCalledTimes(2);
  });
  it('vérifie une grille sans créer de résolution ni de preuve de réponse finale', async () => {
    update.mockRejectedValueOnce(new DatabaseWriteError(403));
    expect(await submissions.checkGrid('a', '123456781234567812341234567812341234')).toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
    const patch = update.mock.calls[1][1];
    expect(Object.keys(patch)).toHaveLength(1);
    expect(Object.values(patch)[0]).toEqual(
      expect.objectContaining({ kind: 'grid', correct: true }),
    );
  });
  it('vérifie une grille même si le catalogue ne fournit pas de drapeau public', async () => {
    riddles.set([
      {
        id: 'a',
        title: 'La lampe',
        prompt: '',
        order: 0,
        gridReady: false,
        answerReady: false,
        solutions: [],
      },
    ]);
    update.mockRejectedValueOnce(new DatabaseWriteError(403));
    expect(await submissions.checkGrid('a', '123456781234567812341234567812341234')).toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
  });
  it('explique quand la validation distante de la grille n’est pas configurée', async () => {
    update.mockRejectedValue(new DatabaseWriteError(403));
    await expect(
      submissions.checkGrid('a', '123456781234567812341234567812341234'),
    ).rejects.toThrow('La vérification de la grille n’est pas configurée');
    expect(update).toHaveBeenCalledTimes(2);
  });
  it('vérifie un nom de famille en conservant le prénom ciblé dans l’essai', async () => {
    update.mockRejectedValueOnce(new DatabaseWriteError(403));
    expect(await submissions.checkSurname('a', 'bob', 'Brown')).toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
    const patch = update.mock.calls[1][1];
    expect(Object.values(patch)[0]).toEqual(
      expect.objectContaining({
        kind: 'surname',
        target: 'bob',
        answer: 'Brown',
        normalizedAnswer: 'BROWN',
        correct: true,
      }),
    );
  });
  it('enregistre une grille incorrecte en un seul appel', async () => {
    expect(await submissions.checkGrid('a', '123456781234567812341234567812341234')).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
    expect(Object.values(update.mock.calls[0][1])[0]).toEqual(
      expect.objectContaining({ kind: 'grid', correct: false }),
    );
  });
  it('conserve les 110 cases du mot caché, y compris les zéros initiaux, sans créer de résolution finale', async () => {
    const code = '01'.repeat(55);
    update.mockRejectedValueOnce(new DatabaseWriteError(403));
    expect(await submissions.checkGrid('a', code, 'fourchette-large')).toBe(true);
    const patch = update.mock.calls[1][1];
    expect(Object.keys(patch)).toHaveLength(1);
    expect(Object.values(patch)[0]).toEqual(
      expect.objectContaining({
        kind: 'grid',
        answer: code,
        normalizedAnswer: code,
        correct: true,
        target: 'fourchette-large',
      }),
    );
  });
  it('refuse l’ancien encodage à une seule position et les codes de grille mal formés', async () => {
    for (const code of [
      '123412341234123412341234',
      '1'.repeat(35),
      '9'.repeat(36),
      '0'.repeat(109),
      '2'.repeat(110),
    ])
      await expect(submissions.checkGrid('a', code)).rejects.toThrow('Complète la grille');
    expect(update).not.toHaveBeenCalled();
  });
  it('refuse un identifiant de version de grille invalide avant toute écriture', async () => {
    await expect(submissions.checkGrid('a', '0'.repeat(110), 'bad version')).rejects.toThrow(
      'version',
    );
    expect(update).not.toHaveBeenCalled();
  });
  it('refuse une soumission sans nom avant toute écriture', async () => {
    requireParticipant.mockImplementation(() => {
      throw new Error('Nom requis');
    });
    await expect(submissions.submit('a', 'lampe')).rejects.toThrow('Nom requis');
    expect(update).not.toHaveBeenCalled();
  });

  it('enregistre une réussite personnelle même si un autre joueur a déjà résolu l’énigme', async () => {
    riddles.set([
      {
        id: 'a',
        title: 'La lampe',
        prompt: '',
        order: 0,
        solutions: [
          {
            participantId: 'bob',
            participantName: 'Bob',
            riddleId: 'a',
            riddleTitle: 'La lampe',
            roundId: 'one',
            solvedAt: 1,
          },
        ],
      },
    ]);
    update.mockRejectedValueOnce(new DatabaseWriteError(401));
    expect(await submissions.submit('a', 'lampe')).toBe(true);
    const patch = update.mock.calls[1][1];
    expect(patch['solves/a/alice']).toEqual(expect.objectContaining({ participantId: 'alice' }));
    expect(patch['solves/a/bob']).toBeUndefined();
  });
});
