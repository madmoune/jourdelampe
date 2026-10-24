import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuotesStore } from '../../core/services/quotes-store';
import { PotluckStore } from '../../core/services/potluck-store';
import { initialQuoteCatalog, parseQuoteCatalog } from '../../core/utils/quote-catalog';
import { Maintenance } from './maintenance';

describe('catalogues distincts dans la gestion', () => {
  it('affiche les invités par défaut et compte les retraits séparément pour l’AI', async () => {
    const quotes = parseQuoteCatalog(initialQuoteCatalog());
    const entries = signal(
      quotes.map((quote) => (quote.id === 'ai-merci' ? { ...quote, active: false } : quote)),
    );
    const store = { entries, ready: signal(true), loading: signal(false), error: signal('') };
    await TestBed.configureTestingModule({
      imports: [Maintenance],
      providers: [
        provideRouter([]),
        { provide: QuotesStore, useValue: store },
        { provide: PotluckStore, useValue: { active: signal([]) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Maintenance);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.quote-card')).toHaveLength(6);
    expect(page.querySelectorAll('.quote-card.ai')).toHaveLength(0);
    expect(page.querySelector('.count')?.textContent).toContain('6 citations en rotation');

    const tabs = page.querySelectorAll<HTMLButtonElement>('.catalog-switch button');
    tabs[1].click();
    fixture.detectChanges();
    expect(page.querySelectorAll('.quote-card.ai')).toHaveLength(9);
    expect(page.querySelector('.catalog-description')?.textContent).toContain('Une chance sur dix');
    expect(page.querySelector('.count')?.textContent).toContain('9 répliques actives');
    page.querySelectorAll<HTMLButtonElement>('.tabs button')[1].click();
    fixture.detectChanges();
    expect(page.querySelectorAll('.quote-card')).toHaveLength(1);
    expect(page.querySelector('.quote-card blockquote')?.textContent).toBe(
      quotes.find((quote) => quote.id === 'ai-merci')?.text,
    );

    tabs[0].click();
    fixture.detectChanges();
    expect(page.querySelectorAll('.quote-card')).toHaveLength(6);
    expect(page.querySelector('.tabs button')?.getAttribute('aria-pressed')).toBe('true');
  });
});
