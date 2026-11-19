import { RiddleReplies } from './riddle-replies';

describe('répliques de l’AI aux réponses', () => {
  it('fait tourner douze répliques sans répétition et sans doublon entre deux séries', () => {
    const replies = new RiddleReplies();
    let previous = '';
    for (let cycle = 0; cycle < 4; cycle++) {
      const current = Array.from({ length: 12 }, () => replies.wrongAnswer('Alice Roy'));
      expect(new Set(current).size).toBe(12);
      expect(current[0]).not.toBe(previous);
      expect(
        current.every((reply) => reply.startsWith('Alice Roy, ce n’est pas la bonne réponse. ')),
      ).toBe(true);
      previous = current.at(-1)!;
    }
  });

  it('utilise toujours le nom actuel sans conserver celui du joueur précédent', () => {
    const replies = new RiddleReplies();
    replies.wrongAnswer('Alice Roy');
    const message = replies.wrongAnswer('Éric Martin');
    expect(message).toContain('Éric Martin');
    expect(message).not.toContain('Alice Roy');
  });

  it('fait tourner cinq répliques de réussite indépendamment des échecs', () => {
    const replies = new RiddleReplies();
    const drawSuccesses = () =>
      Array.from({ length: 5 }, () => {
        replies.wrongAnswer('Alice Roy');
        return replies.correctAnswer();
      });
    const first = drawSuccesses();
    const second = drawSuccesses();
    expect(new Set(first).size).toBe(5);
    expect(new Set(second)).toEqual(new Set(first));
    expect(second[0]).not.toBe(first.at(-1));
    expect(first.some((reply) => reply.includes('Détruire le monde'))).toBe(true);
    expect(first.some((reply) => reply.includes('premier brouillon'))).toBe(true);
  });
});
