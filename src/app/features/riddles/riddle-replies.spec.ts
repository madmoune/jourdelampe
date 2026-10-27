import { RiddleReplies } from './riddle-replies';

describe('répliques de l’AI aux mauvaises réponses', () => {
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
});
