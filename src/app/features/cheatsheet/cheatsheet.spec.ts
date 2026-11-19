import {
  SEMAPHORE_CONTROLS,
  SEMAPHORE_SIGNALS,
} from './cheatsheet';

describe('légende du sémaphore', () => {
  it('contient une pose unique pour chaque lettre de A à Z', () => {
    expect(SEMAPHORE_SIGNALS).toHaveLength(26);
    expect(SEMAPHORE_SIGNALS.map((signal) => signal.letter).join('')).toBe(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    );
    expect(new Set(SEMAPHORE_SIGNALS.map((signal) => `${signal.left}:${signal.right}`)).size).toBe(
      26,
    );
  });

  it('référence les signaux de commande nécessaires aux chiffres et à l’annulation', () => {
    expect(SEMAPHORE_CONTROLS.map((control) => control.title)).toEqual([
      'Chiffres',
      'Retour aux lettres',
      'Annulation',
    ]);
  });
});
