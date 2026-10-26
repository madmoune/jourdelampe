import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { DatabaseWriteError, FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleSubmissions } from './riddle-submissions';

describe('soumission et enregistrement des réponses', () => {
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
            riddles: signal([{ id: 'a', title: 'La lampe', solutions: [] }]),
          },
        },
      ],
    });
    submissions = TestBed.inject(RiddleSubmissions);
  });

  it('envoie la preuve privée et le nom de la résolution dans une même écriture avec l’heure serveur', async () => {
    await submissions.submit('a', '  é-clair! ');
    expect(update).toHaveBeenCalledWith(
      'game',
      {
        'solves/a/alice': {
          participantId: 'alice',
          participantName: 'Alice Roy',
          riddleId: 'a',
          riddleTitle: 'La lampe',
          roundId: 'one',
          solvedAt: { '.sv': 'timestamp' },
        },
        'proofs/alice/a': { answer: 'ECLAIR', roundId: 'one' },
      },
      'test-token',
    );
  });

  it('refuse une soumission sans nom avant toute écriture', async () => {
    requireParticipant.mockImplementation(() => {
      throw new Error('Nom requis');
    });
    await expect(submissions.submit('a', 'lampe')).rejects.toThrow('Nom requis');
    expect(update).not.toHaveBeenCalled();
  });

  it('ne confirme aucune résolution lorsque Firebase refuse la réponse', async () => {
    update.mockRejectedValue(new DatabaseWriteError(401));
    await expect(submissions.submit('a', 'fausse réponse')).rejects.toThrow('n’a pas été validée');
  });
});
