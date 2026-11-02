import { GameMode, GameRiddle, RiddleSolution } from '../riddles/game.model';
import { parseParticipant, Participant } from '../riddles/participant';

type ProgressRiddle = GameRiddle & { readonly solutions: readonly RiddleSolution[] };

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
  const teamMetaUnlocked =
    riddles.length > 0 && riddles.every((riddle) => riddle.solutions.length > 0);
  return participants
    .map((participant) => {
      const progress = riddles.map((riddle) => {
        const solution = riddle.solutions.find((entry) => entry.participantId === participant.id);
        return {
          id: riddle.id,
          title: riddle.title,
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
        percentage: riddles.length ? Math.round((solvedCount / riddles.length) * 100) : 0,
        firstSolveCount: progress.filter((riddle) => riddle.firstForTeam).length,
        lastSolvedAt,
        metaUnlocked:
          ready &&
          (mode === 'team'
            ? teamMetaUnlocked
            : riddles.length > 0 && solvedCount === riddles.length),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr-CA') || a.id.localeCompare(b.id));
}
