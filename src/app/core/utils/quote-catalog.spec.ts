import {
  activeQuotes,
  initialQuoteCatalog,
  parseQuoteCatalog,
  validateQuoteLink,
  validateQuoteText,
} from './quote-catalog';

describe('catalogue des citations', () => {
  it('importe les six citations et les dix répliques de l’AI avec le lien YouTube', () => {
    const quotes = parseQuoteCatalog(initialQuoteCatalog());
    expect(activeQuotes(quotes, 'regular')).toHaveLength(6);
    expect(activeQuotes(quotes, 'ai')).toHaveLength(10);
    expect(quotes.find((quote) => quote.id === 'remi')?.href).toBe(
      'https://www.youtube.com/watch?v=pv1kirNU8n4',
    );
  });

  it('garde un catalogue vide et les citations retirées hors rotation', () => {
    expect(parseQuoteCatalog({ initialized: true })).toEqual([]);
    const initial = initialQuoteCatalog();
    const quotes = parseQuoteCatalog({
      ...initial,
      items: { photon: { ...initial.items!['photon'], active: false } },
      ai: null,
    });
    expect(activeQuotes(quotes, 'regular')).toEqual([]);
  });

  it('sépare les répliques de l’AI des citations ordinaires', () => {
    const catalog = initialQuoteCatalog();
    expect(Object.values(catalog.items!).every((quote) => quote.kind === 'regular')).toBe(true);
    expect(Object.values(catalog.ai!).every((quote) => quote.kind === 'ai')).toBe(true);
    const mixed = parseQuoteCatalog({
      ...catalog,
      items: { ...catalog.items, bad: catalog.ai!['ai-merci'] },
      ai: { ...catalog.ai, bad: catalog.items!['photon'] },
    });
    expect(activeQuotes(mixed, 'regular')).toHaveLength(6);
    expect(activeQuotes(mixed, 'ai')).toHaveLength(10);
  });

  it('normalise les espaces et refuse les textes vides ou trop longs', () => {
    expect(validateQuoteText('  Une\n citation  ! ')).toBe('Une citation !');
    expect(() => validateQuoteText(' \n ')).toThrow('Écris une citation');
    expect(() => validateQuoteText('a'.repeat(141))).toThrow('140 caractères');
  });

  it('refuse les protocoles exécutables ou incomplets dans les liens', () => {
    expect(validateQuoteLink('')).toBeNull();
    expect(validateQuoteLink('https://example.com')).toBe('https://example.com/');
    expect(() => validateQuoteLink('javascript:alert(1)')).toThrow('https://');
    expect(() => validateQuoteLink('example.com')).toThrow('https://');
    const initial = initialQuoteCatalog();
    expect(
      parseQuoteCatalog({
        ...initial,
        items: { bad: { ...initial.items!['remi'], href: 'javascript:alert(1)' } },
        ai: null,
      }),
    ).toEqual([]);
  });

  it('évite les doublons de texte, même avec des identifiants ou une casse différents', () => {
    const quotes = parseQuoteCatalog(initialQuoteCatalog());
    const regular = quotes.find((quote) => quote.kind === 'regular')!;
    expect(
      activeQuotes(
        [regular, { ...regular, id: 'duplicate', text: regular.text.toUpperCase() }],
        'regular',
      ),
    ).toHaveLength(1);
  });
});
