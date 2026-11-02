import { computed, inject, Injectable } from '@angular/core';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';

/** Accès au méta et aux informations débloquées, sans attribuer les réussites des autres. */
@Injectable({ providedIn: 'root' })
export class PlayerProgress {
  readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  readonly riddles = computed(() => {
    const participantId = this.participants.participant()?.id;
    const team = this.game.mode() === 'team';
    return this.game.riddles().map((riddle) => {
      const personalSolutions = riddle.solutions.filter(
        (solution) => solution.participantId === participantId,
      );
      const solutions = team ? riddle.solutions : personalSolutions;
      return {
        ...riddle,
        solutions,
        solvedByMe: personalSolutions.length > 0,
        infoUnlocked: this.game.ready() && solutions.length > 0,
      };
    });
  });
  readonly solvedCount = computed(
    () => this.riddles().filter((riddle) => riddle.solutions.length > 0).length,
  );
  readonly metaUnlocked = computed(
    () =>
      this.game.ready() &&
      this.game.catalog().length > 0 &&
      this.solvedCount() === this.game.catalog().length,
  );
}
