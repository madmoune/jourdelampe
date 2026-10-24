import { countdownUntil } from './countdown';

describe('compte à rebours', () => {
  const target = '2027-01-01T00:00:00-05:00';

  it('calcule les quatre unités avant minuit au Québec', () => {
    expect(countdownUntil(target, Date.parse('2026-12-30T21:56:56-05:00'))).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      complete: false,
    });
  });

  it('utilise le même instant quel que soit le fuseau du visiteur', () => {
    expect(countdownUntil(target, Date.parse('2027-01-01T04:59:59Z'))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      complete: false,
    });
  });

  it('termine exactement à minuit', () => {
    expect(countdownUntil(target, Date.parse('2027-01-01T05:00:00Z')).complete).toBe(true);
  });

  it('ne produit jamais de temps négatif après le nouvel an', () => {
    expect(countdownUntil(target, Date.parse('2027-02-01T05:00:00Z'))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      complete: true,
    });
  });

  it('refuse une date invalide', () => {
    expect(() => countdownUntil('date invalide', Date.now())).toThrow();
  });
});
