import { AI_QUOTES } from '../config/ai-quotes.config';
import { CONTENT } from '../config/content.config';
import { quoteRandom, selectQuotes } from './select-quotes';

describe('tirage des citations', () => {
  it('mélange les citations entre les six emplacements, sans répétition ni mutation', () => {
    const originalIds = CONTENT.quotes.map((quote) => quote.id);
    const first = selectQuotes(CONTENT.quotes, AI_QUOTES, 6, () => 0.5);
    const second = selectQuotes(CONTENT.quotes, AI_QUOTES, 6, () => 0.99);

    expect(new Set(first.map((quote) => quote.id)).size).toBe(6);
    expect(first.map((quote) => quote.id)).not.toEqual(second.map((quote) => quote.id));
    expect(CONTENT.quotes.map((quote) => quote.id)).toEqual(originalIds);
    expect(first.find((quote) => quote.id === 'remi')?.href).toBe(
      'https://www.youtube.com/watch?v=pv1kirNU8n4',
    );
  });

  it('réserve exactement les tirages inférieurs à 0,1 à une intervention de l’AI', () => {
    const ai = selectQuotes(CONTENT.quotes, AI_QUOTES, 6, () => 0.099);
    const regular = selectQuotes(CONTENT.quotes, AI_QUOTES, 6, () => 0.1);

    expect(ai[0].author).toBe('AI');
    expect(ai.slice(1).every((quote) => quote.author !== 'AI')).toBe(true);
    expect(new Set(ai.map((quote) => quote.id)).size).toBe(6);
    expect(regular.every((quote) => quote.author !== 'AI')).toBe(true);
  });

  it('tire une réplique parmi les dix et la place uniquement au premier emplacement', () => {
    // Tirage de la visite, mélange des citations ordinaires, choix de la réplique.
    let index = 0;
    const shuffleRolls = CONTENT.quotes.length - 1;
    const quotes = selectQuotes(CONTENT.quotes, AI_QUOTES, 6, () => {
      const current = index++;
      return current === 0 ? 0.05 : current <= shuffleRolls ? 0.5 : 0.75;
    });

    expect(quotes.map((quote) => quote.author === 'AI')).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(quotes[0]).toBe(AI_QUOTES[7]);
    expect(new Set(quotes.map((quote) => quote.id)).size).toBe(6);
  });

  it('accepte un catalogue agrandi pour les futures citations des invités', () => {
    const guest = { id: 'invite-1', text: 'Une citation d’un invité.', href: null };
    const quotes = selectQuotes([...CONTENT.quotes, guest], AI_QUOTES, 7, () => 0.99);

    expect(quotes).toContain(guest);
    expect(new Set(quotes.map((quote) => quote.id)).size).toBe(7);
  });

  it('accepte les catalogues vides sans introduire de doublons', () => {
    expect(selectQuotes([], [], 6)).toEqual([]);
    expect(selectQuotes(CONTENT.quotes, [], 6, () => 0)).toHaveLength(6);
    expect(selectQuotes([], AI_QUOTES, 6, () => 0.9)).toEqual([]);
    expect(selectQuotes([], AI_QUOTES, 6, () => 0.05)).toEqual([AI_QUOTES[0]]);
    expect(selectQuotes(CONTENT.quotes.slice(0, 1), [], 6)).toHaveLength(1);
  });

  it('conserve la décision de l’AI quand des citations arrivent pendant la visite', () => {
    const guest = { id: 'invite', text: 'Une nouvelle citation.', href: null };
    const interventions: boolean[] = [];
    for (let index = 0; index < 20; index++) {
      const seed = index * 1234567;
      const before = selectQuotes(CONTENT.quotes, AI_QUOTES, 6, quoteRandom(seed));
      const after = selectQuotes([...CONTENT.quotes, guest], AI_QUOTES, 6, quoteRandom(seed));
      expect(before[0].author === 'AI').toBe(after[0].author === 'AI');
      interventions.push(before[0].author === 'AI');
      expect(selectQuotes(CONTENT.quotes, AI_QUOTES, 6, quoteRandom(seed))).toEqual(before);
    }
    expect(interventions).toContain(true);
    expect(interventions).toContain(false);
  });
});
