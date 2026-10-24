import { AI_QUOTES } from '../config/ai-quotes.config';
import { CONTENT } from '../config/content.config';
import type { ManagedQuote, QuoteCatalog, QuoteKind, StoredQuote } from '../models/quote';

export const QUOTE_MAX_LENGTH = 140;

export function cleanQuoteText(text: string): string {
  return text.replace(/\s+/gu, ' ').trim();
}

export function quoteTextKey(text: string): string {
  return cleanQuoteText(text).normalize('NFKC').toLocaleLowerCase('fr');
}

export function validateQuoteText(text: string): string {
  const cleaned = cleanQuoteText(text);
  if (!cleaned) throw new Error('Écris une citation avant de l’ajouter.');
  if (cleaned.length > QUOTE_MAX_LENGTH) {
    throw new Error(`La citation doit contenir au maximum ${QUOTE_MAX_LENGTH} caractères.`);
  }
  return cleaned;
}

export function validateQuoteLink(href: string): string | null {
  const cleaned = href.trim();
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    if (url.protocol === 'https:' && cleaned.length <= 2048) return url.href;
  } catch {
    // Une adresse incomplète reçoit le même message que les protocoles refusés.
  }
  throw new Error('Le lien doit être une adresse complète commençant par https://.');
}

/** Enregistré une fois, sans réimporter les citations retirées. */
export function initialQuoteCatalog(): QuoteCatalog {
  const items: Record<string, StoredQuote> = {};
  const ai: Record<string, StoredQuote> = {};
  for (const [kind, quotes] of [
    ['regular', CONTENT.quotes],
    ['ai', AI_QUOTES],
  ] as const) {
    for (const quote of quotes) {
      const group = kind === 'ai' ? ai : items;
      group[quote.id] = {
        text: quote.text,
        href: quote.href,
        kind,
        active: true,
        createdAt: 0,
        updatedAt: 0,
      };
    }
  }
  return { initialized: true, version: 2, items, ai };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validation des valeurs réseau avant de les afficher. */
export function parseQuoteCatalog(value: unknown): readonly ManagedQuote[] {
  if (!isRecord(value) || value['initialized'] !== true) {
    throw new Error('Le catalogue des citations est invalide.');
  }
  const humanQuotes = parseQuoteGroup(
    value['items'],
    value['version'] === 2 ? 'regular' : undefined,
  );
  const aiQuotes = parseQuoteGroup(value['ai'], 'ai');
  const quotes = new Map<string, ManagedQuote>();
  for (const quote of [...humanQuotes, ...aiQuotes]) quotes.set(`${quote.kind}:${quote.id}`, quote);
  return [...quotes.values()];
}

function parseQuoteGroup(items: unknown, expectedKind?: QuoteKind): readonly ManagedQuote[] {
  if (items == null) return [];
  if (!isRecord(items)) throw new Error('Le catalogue des citations est invalide.');

  return Object.entries(items).flatMap(([id, item]): ManagedQuote[] => {
    if (!/^[A-Za-z0-9_-]{1,80}$/u.test(id) || !isRecord(item)) return [];
    const kind = item['kind'];
    const text = item['text'];
    if (
      (kind !== 'regular' && kind !== 'ai') ||
      (expectedKind !== undefined && kind !== expectedKind) ||
      typeof text !== 'string' ||
      !cleanQuoteText(text) ||
      text.length > QUOTE_MAX_LENGTH ||
      typeof item['active'] !== 'boolean' ||
      typeof item['createdAt'] !== 'number' ||
      typeof item['updatedAt'] !== 'number'
    )
      return [];

    let href: string | null;
    try {
      href = validateQuoteLink(typeof item['href'] === 'string' ? item['href'] : '');
    } catch {
      return [];
    }
    return [
      {
        id,
        text: cleanQuoteText(text),
        kind,
        active: item['active'],
        href,
        ...(kind === 'ai' ? { author: 'AI' } : {}),
        createdAt: item['createdAt'],
        updatedAt: item['updatedAt'],
      },
    ];
  });
}

export function activeQuotes(
  quotes: readonly ManagedQuote[],
  kind: 'regular' | 'ai',
): readonly ManagedQuote[] {
  const seen = new Set<string>();
  return quotes.filter((quote) => {
    const key = quoteTextKey(quote.text);
    if (!quote.active || quote.kind !== kind || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
