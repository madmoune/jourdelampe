import { GameRiddle, RiddleSolution } from '../riddles/game.model';
import { Participant } from '../riddles/participant';
import { parseParticipants, summarizePlayers } from './player-overview';

describe('progression et contribution des joueurs enregistrés', () => {
  const participants: readonly Participant[] = [
    { id: 'alice', name: 'Alice', updatedAt: 1 },
    { id: 'bob', name: 'Bob', updatedAt: 1 },
    { id: 'charlie', name: 'Charlie', updatedAt: 1 },
  ];
  const solve = (riddleId: string, participantId: string, solvedAt: number): RiddleSolution => ({
    riddleId,
    riddleTitle: riddleId,
    participantId,
    participantName: 'Ancien nom',
    roundId: 'one',
    solvedAt,
  });
  const riddle = (
    id: string,
    solutions: RiddleSolution[] = [],
  ): GameRiddle & { solutions: RiddleSolution[] } => ({
    id,
    title: id,
    prompt: '',
    order: 0,
    solutions,
  });

  it('inclut tous les profils, même sans réussite, et garde distincts les joueurs du même nom', () => {
    const profiles = parseParticipants({
      bob: { name: 'Même nom', updatedAt: 1 },
      alice: { name: 'Même nom', updatedAt: 2 },
    });
    const players = summarizePlayers(profiles, [riddle('a')], 'team', true);
    expect(players.map((player) => player.id)).toEqual(['alice', 'bob']);
    expect(players.every((player) => player.solvedCount === 0 && player.percentage === 0)).toBe(
      true,
    );
    expect(
      players.every((player) => player.firstSolveCount === 0 && player.lastSolvedAt === null),
    ).toBe(true);
    expect(players.every((player) => !player.metaUnlocked)).toBe(true);
  });

  it('distingue les réussites personnelles des premières résolutions du groupe', () => {
    const riddles = [
      riddle('a', [solve('a', 'alice', 20), solve('a', 'bob', 10)]),
      riddle('b', [solve('b', 'alice', 30), solve('b', 'bob', 40)]),
      riddle('c'),
    ];
    const [alice, bob, charlie] = summarizePlayers(participants, riddles, 'team', true);
    expect(alice).toMatchObject({
      name: 'Alice',
      solvedCount: 2,
      percentage: 67,
      firstSolveCount: 1,
      lastSolvedAt: 30,
    });
    expect(bob).toMatchObject({ solvedCount: 2, firstSolveCount: 1, lastSolvedAt: 40 });
    expect(charlie.solvedCount).toBe(0);
    expect(alice.riddles[0].firstForTeam).toBe(false);
    expect(alice.riddles[1].firstForTeam).toBe(true);
    expect(alice.riddles[2].solution).toBeUndefined();
  });

  it('crédite tous les joueurs qui obtiennent la première réussite au même instant', () => {
    const riddles = [riddle('a', [solve('a', 'alice', 10), solve('a', 'bob', 10)])];
    const [alice, bob] = summarizePlayers(participants, riddles, 'team', true);
    expect(alice.firstSolveCount).toBe(1);
    expect(bob.firstSolveCount).toBe(1);
  });

  it('partage le méta en équipe sans attribuer les réussites et adapte l’accès au mode individuel', () => {
    const riddles = [riddle('a', [solve('a', 'alice', 10)])];
    const team = summarizePlayers(participants, riddles, 'team', true);
    expect(team.every((player) => player.metaUnlocked)).toBe(true);
    expect(team[1].solvedCount).toBe(0);
    const individual = summarizePlayers(participants, riddles, 'individual', true);
    expect(individual.map((player) => player.metaUnlocked)).toEqual([true, false, false]);
    expect(
      summarizePlayers(participants, riddles, 'team', false).every(
        (player) => !player.metaUnlocked,
      ),
    ).toBe(true);
  });

  it('conserve les joueurs avec une progression nulle après une remise à zéro ou sans catalogue', () => {
    const reset = summarizePlayers(participants, [riddle('a')], 'team', true);
    expect(reset).toHaveLength(3);
    expect(
      reset.every(
        (player) =>
          player.solvedCount === 0 && player.firstSolveCount === 0 && !player.metaUnlocked,
      ),
    ).toBe(true);
    for (const mode of ['team', 'individual'] as const) {
      const empty = summarizePlayers(participants, [], mode, true);
      expect(empty.every((player) => player.percentage === 0 && !player.metaUnlocked)).toBe(true);
    }
  });

  it('accepte une liste vide et refuse une lecture invalide au lieu de masquer des profils', () => {
    expect(parseParticipants(null)).toEqual([]);
    expect(summarizePlayers([], [riddle('a')], 'team', true)).toEqual([]);
    for (const value of [[], 'invalid', { alice: null }, { alice: { name: '', updatedAt: 1 } }]) {
      expect(() => parseParticipants(value)).toThrow();
    }
  });
});
