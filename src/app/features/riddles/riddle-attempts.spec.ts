import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { ParticipantStore } from './participant-store';
import { RiddleAttempts } from './riddle-attempts';

describe('historique privé des essais', () => {
  it('suit le profil, conserve le nom historique et abandonne les réponses de l’ancien profil', async () => {
    const participant = signal({ id: 'alice', name: 'Alice Roy' });
    const raw = new BehaviorSubject<unknown>({
      a: {
        first: {
          kind: 'answer',
          answer: 'Essai',
          correct: false,
          participantName: 'Alice',
          submittedAt: 2,
          roundId: 'one',
        },
      },
    });
    const other = new BehaviorSubject<unknown>(null);
    const watch = vi.fn((path: string) => (path.endsWith('/alice') ? raw : other));
    TestBed.configureTestingModule({
      providers: [
        { provide: ParticipantStore, useValue: { participant } },
        { provide: RealtimeDatabase, useValue: { watch } },
      ],
    });
    const history = TestBed.inject(RiddleAttempts);
    TestBed.tick();
    expect(watch).toHaveBeenCalledWith('game/attempts/alice');
    expect(history.attempts()[0].participantName).toBe('Alice');
    participant.set({ id: 'bob', name: 'Bob' });
    expect(history.attempts()).toEqual([]);
    TestBed.tick();
    expect(watch).toHaveBeenCalledWith('game/attempts/bob');
    raw.next({});
    expect(history.attempts()).toEqual([]);
  });
});
