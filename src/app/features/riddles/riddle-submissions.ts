import { inject, Injectable } from '@angular/core';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { DatabaseWriteError, FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from './game-store';
import { normalizeAnswer } from './game.model';
import { ParticipantStore } from './participant-store';

const SERVER_TIME = { '.sv': 'timestamp' };

@Injectable({ providedIn: 'root' })
export class RiddleSubmissions {
  private readonly participants = inject(ParticipantStore);
  private readonly session = inject(AnonymousSession);
  private readonly game = inject(GameStore);
  private readonly database = inject(FirebaseRest);

  async submit(riddleId: string, answer: string): Promise<void> {
    const participant = this.participants.requireParticipant();
    const riddle = this.game.riddles().find((item) => item.id === riddleId);
    const round = this.game.round();
    if (!this.game.ready() || !riddle || !round)
      throw new Error('Cette énigme est indisponible pour le moment.');
    const normalized = normalizeAnswer(answer);
    if (!normalized || answer.length > 200)
      throw new Error('Entre une réponse de 200 caractères ou moins.');
    if (riddle.solutions.some((solution) => solution.participantId === participant.id)) return;
    try {
      await this.database.update(
        'game',
        {
          [`solves/${riddle.id}/${participant.id}`]: {
            participantId: participant.id,
            participantName: participant.name,
            riddleId: riddle.id,
            riddleTitle: riddle.title,
            roundId: round.id,
            solvedAt: SERVER_TIME,
          },
          [`proofs/${participant.id}/${riddle.id}`]: { answer: normalized, roundId: round.id },
        },
        await this.session.token(),
      );
    } catch (error: unknown) {
      if (error instanceof DatabaseWriteError && (error.status === 401 || error.status === 403)) {
        throw new Error('Cette réponse n’a pas été validée. Vérifie-la et réessaie.');
      }
      throw new Error('La réponse n’a pas pu être enregistrée. Réessaie dans un instant.');
    }
  }
}
