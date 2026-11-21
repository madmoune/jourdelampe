import { GameMode, GameRiddle, RiddleSolution } from '../riddles/game.model';
import { parseParticipant, Participant } from '../riddles/participant';
import { META_ID, RIDDLE_COUNT } from '../riddles/riddle-pages';

type ProgressRiddle = GameRiddle & {
  readonly solutions: readonly RiddleSolution[];
  readonly configured?: boolean;
};

export function parseParticipants(value: unknown): readonly Participant[] {
  if (value === null) return [];
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Profils invalides.');
  return Object.entries(value).map(([id, raw]) => {
    const participant = parseParticipant(id, raw);
    if (!participant) throw new Error('Profil invalide.');
    return participant;
  });
}

/** Le catalogue et les résolutions fournis par GameStore concernent la partie courante. */
export function summarizePlayers(
  participants: readonly Participant[],
  riddles: readonly ProgressRiddle[],
  mode: GameMode,
  ready: boolean,
) {
  const mainRiddles = riddles.filter((riddle) => riddle.id !== META_ID);
  const teamMetaUnlocked =
    mainRiddles.length >= RIDDLE_COUNT &&
    mainRiddles.every((riddle) => riddle.solutions.length > 0);
  return participants
    .map((participant) => {
      const progress = mainRiddles.map((riddle) => {
        const solution = riddle.solutions.find((entry) => entry.participantId === participant.id);
        return {
          id: riddle.id,
          title: riddle.title,
          configured: riddle.configured ?? true,
          solution,
          firstForTeam:
            !!solution && riddle.solutions.every((entry) => entry.solvedAt >= solution.solvedAt),
        };
      });
      const solvedCount = progress.filter((riddle) => riddle.solution).length;
      const lastSolvedAt = progress.reduce<number | null>(
        (latest, riddle) =>
          riddle.solution ? Math.max(latest ?? 0, riddle.solution.solvedAt) : latest,
        null,
      );
      return {
        ...participant,
        riddles: progress,
        solvedCount,
        percentage: mainRiddles.length ? Math.round((solvedCount / mainRiddles.length) * 100) : 0,
        firstSolveCount: progress.filter((riddle) => riddle.firstForTeam).length,
        lastSolvedAt,
        metaUnlocked:
          ready &&
          (mode === 'team'
            ? teamMetaUnlocked
            : mainRiddles.length >= RIDDLE_COUNT && solvedCount === mainRiddles.length),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr-CA') || a.id.localeCompare(b.id));
}
