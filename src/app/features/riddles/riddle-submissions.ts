import { inject, Injectable } from '@angular/core';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { DatabaseWriteError, FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from './game-store';
import { normalizeAnswer } from './game.model';
import { ParticipantStore } from './participant-store';

const SERVER_TIME = { '.sv': 'timestamp' };
const denied = (error: unknown) =>
  error instanceof DatabaseWriteError && (error.status === 401 || error.status === 403);

@Injectable({ providedIn: 'root' })
export class RiddleSubmissions {
  private readonly participants = inject(ParticipantStore);
  private readonly session = inject(AnonymousSession);
  private readonly game = inject(GameStore);
  private readonly database = inject(FirebaseRest);

  submit(riddleId: string, answer: string): Promise<boolean> {
    return this.check(riddleId, answer, 'answer');
  }
  checkGrid(riddleId: string, code: string): Promise<boolean> {
    return this.check(riddleId, code, 'grid');
  }

  private async check(riddleId: string, answer: string, kind: 'answer' | 'grid'): Promise<boolean> {
    const participant = this.participants.requireParticipant();
    const riddle = this.game.riddles().find((item) => item.id === riddleId);
    const round = this.game.round();
    if (!this.game.ready() || !riddle || !round)
      throw new Error('Cette énigme est indisponible pour le moment.');
    if (kind === 'grid' && riddle.gridReady !== true)
      throw new Error('La vérification sera disponible avec les énoncés.');
    const normalized = normalizeAnswer(answer);
    if (!normalized || answer.length > 200 || normalized.length > 200)
      throw new Error('Entre une réponse de 200 caractères ou moins.');
    if (kind === 'grid' && !/^[1-8]{36}$/u.test(answer))
      throw new Error('Complète la grille avant de la vérifier.');
    if (
      kind === 'answer' &&
      riddle.solutions.some((solution) => solution.participantId === participant.id)
    )
      return true;
    const attemptPath = `attempts/${participant.id}/${riddle.id}/${crypto.randomUUID()}`;
    const attempt = {
      kind,
      answer: answer.trim(),
      normalizedAnswer: normalized,
      participantName: participant.name,
      roundId: round.id,
      submittedAt: SERVER_TIME,
    };
    const token = await this.session.token();
    const success: Record<string, unknown> = { [attemptPath]: { ...attempt, correct: true } };
    if (kind === 'answer') {
      success[`solves/${riddle.id}/${participant.id}`] = {
        participantId: participant.id,
        participantName: participant.name,
        riddleId: riddle.id,
        riddleTitle: riddle.title,
        roundId: round.id,
        solvedAt: SERVER_TIME,
      };
      success[`proofs/${participant.id}/${riddle.id}`] = { answer: normalized, roundId: round.id };
    }
    try {
      // Les essais incorrects, plus fréquents, ne nécessitent qu’un aller-retour.
      // Le serveur vérifie le verdict; une bonne réponse est enregistrée ensuite avec sa résolution.
      await this.database.update('game', { [attemptPath]: { ...attempt, correct: false } }, token);
      return false;
    } catch (error: unknown) {
      if (denied(error)) {
        try {
          await this.database.update('game', success, token);
          return true;
        } catch {
          /* Une erreur d’accès ou de partie n’est pas une mauvaise réponse. */
        }
      }
      throw new Error(
        'La réponse n’a pas pu être vérifiée et enregistrée. Réessaie dans un instant.',
      );
    }
  }
}
