/** Une citation affichable dans une pastille. */
export interface Quote {
  readonly id: string;
  readonly text: string;
  readonly href: string | null;
  readonly author?: string;
}

export type QuoteKind = 'regular' | 'ai';

export interface StoredQuote {
  readonly text: string;
  readonly kind: QuoteKind;
  readonly active: boolean;
  readonly href?: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface ManagedQuote extends Quote {
  readonly kind: QuoteKind;
  readonly active: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface QuoteCatalog {
  readonly initialized: true;
  readonly version: 2;
  readonly items?: Readonly<Record<string, StoredQuote>> | null;
  readonly ai?: Readonly<Record<string, StoredQuote>> | null;
}
