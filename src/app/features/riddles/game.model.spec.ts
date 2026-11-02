import { parseSecrets, validGridCode } from './game.model';

describe('configuration privée des réponses et des grilles', () => {
  it('accepte une grille de mots cachés sans inventer de réponse finale', () => {
    const gridAnswer = '01'.repeat(55);
    expect(parseSecrets({ fourchette: { gridAnswer } })).toEqual({ fourchette: { gridAnswer } });
    expect(
      parseSecrets({
        zebra: { answer: 'Code', normalizedAnswer: 'CODE', gridAnswer: '1'.repeat(36) },
      })['zebra'].answer,
    ).toBe('Code');
  });

  it('refuse une réponse partielle ou un format de grille non reconnu', () => {
    for (const secret of [
      {},
      { answer: 'Code' },
      { normalizedAnswer: 'CODE' },
      { gridAnswer: '2'.repeat(110) },
      { gridAnswer: '0'.repeat(109) },
      { answer: 'Code', gridAnswer: '0'.repeat(110) },
    ])
      expect(() => parseSecrets({ fourchette: secret })).toThrow();
    expect(validGridCode('1'.repeat(36))).toBe(true);
    expect(validGridCode('0'.repeat(110))).toBe(true);
    expect(validGridCode('9'.repeat(36))).toBe(false);
  });
});
