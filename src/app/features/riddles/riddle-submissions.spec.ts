import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { DatabaseWriteError, FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleSubmissions } from './riddle-submissions';

describe('validation et historique des réponses', () => {
  let update: ReturnType<typeof vi.fn>;
  let requireParticipant: ReturnType<typeof vi.fn>;
  let submissions: RiddleSubmissions;
  beforeEach(() => {
    update = vi.fn().mockResolvedValue(undefined);
    requireParticipant = vi.fn(() => ({ id: 'alice', name: 'Alice Roy' }));
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
            riddles: signal([
              { id: 'a', title: 'La lampe', gridReady: true, answerReady: false, solutions: [] },
            ]),
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
    await expect(submissions.submit('a', 'Réponse')).rejects.toThrow('n’a pas pu être vérifiée');
    expect(update).toHaveBeenCalledTimes(2);
  });
  it('vérifie une grille sans créer de résolution ni de preuve de réponse finale', async () => {
    update.mockRejectedValueOnce(new DatabaseWriteError(403));
    expect(await submissions.checkGrid('a', '123412341234123412341234')).toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
    const patch = update.mock.calls[1][1];
    expect(Object.keys(patch)).toHaveLength(1);
    expect(Object.values(patch)[0]).toEqual(
      expect.objectContaining({ kind: 'grid', correct: true }),
    );
  });
  it('enregistre une grille incorrecte en un seul appel', async () => {
    expect(await submissions.checkGrid('a', '123412341234123412341234')).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
    expect(Object.values(update.mock.calls[0][1])[0]).toEqual(
      expect.objectContaining({ kind: 'grid', correct: false }),
    );
  });
  it('refuse une soumission sans nom avant toute écriture', async () => {
    requireParticipant.mockImplementation(() => {
      throw new Error('Nom requis');
    });
    await expect(submissions.submit('a', 'lampe')).rejects.toThrow('Nom requis');
    expect(update).not.toHaveBeenCalled();
  });
});
