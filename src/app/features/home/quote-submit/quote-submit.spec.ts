import { TestBed } from '@angular/core/testing';
import type { ManagedQuote } from '../../../core/models/quote';
import { QuotesStore } from '../../../core/services/quotes-store';
import { QuoteDeck } from '../quote-deck';
import { QuoteSubmit } from './quote-submit';

describe('confirmation et affichage d’une nouvelle citation', () => {
  async function setup(add: (text: string) => Promise<ManagedQuote>) {
    const showAdded = vi.fn();
    await TestBed.configureTestingModule({
      imports: [QuoteSubmit],
      providers: [
        { provide: QuotesStore, useValue: { add } },
        { provide: QuoteDeck, useValue: { showAdded } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(QuoteSubmit);
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const input = page.querySelector('input')!;
    input.value = 'Ma citation.';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return { fixture, page, input, showAdded };
  }

  it('met en avant la citation retournée uniquement après confirmation de Firebase', async () => {
    let confirm!: (quote: ManagedQuote) => void;
    const pending = new Promise<ManagedQuote>((resolve) => {
      confirm = resolve;
    });
    const { fixture, input, showAdded, page } = await setup(() => pending);
    expect(showAdded).not.toHaveBeenCalled();
    expect(input.value).toBe('Ma citation.');
    const quote: ManagedQuote = {
      id: 'firebase-id',
      text: 'Ma citation.',
      kind: 'regular',
      active: true,
      href: null,
      createdAt: 1,
      updatedAt: 1,
    };
    confirm(quote);
    await fixture.whenStable();
    expect(showAdded).toHaveBeenCalledExactlyOnceWith(quote);
    expect(input.value).toBe('');
    expect(page.textContent).toContain('Merci! Ta citation rejoint la rotation.');
  });

  it('garde le texte et la pastille actuelle si l’enregistrement échoue', async () => {
    const { fixture, input, showAdded, page } = await setup(async () => {
      throw new Error('Écriture refusée.');
    });
    await fixture.whenStable();
    expect(showAdded).not.toHaveBeenCalled();
    expect(input.value).toBe('Ma citation.');
    expect(page.textContent).toContain('Écriture refusée.');
  });
});
