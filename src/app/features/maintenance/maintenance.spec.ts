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

describe('confirmation du retrait des citations', () => {
  afterEach(() => vi.restoreAllMocks());

  async function setup(kind: 'regular' | 'ai', active = true) {
    const quote = parseQuoteCatalog(initialQuoteCatalog()).find((item) => item.kind === kind)!;
    const entry = { ...quote, active };
    const setActive = vi.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Maintenance],
      providers: [
        provideRouter([]),
        {
          provide: QuotesStore,
          useValue: {
            entries: signal([entry]),
            ready: signal(true),
            loading: signal(false),
            error: signal(''),
            setActive,
          },
        },
        { provide: PotluckStore, useValue: { active: signal([]) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Maintenance);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    if (kind === 'ai') {
      page.querySelectorAll<HTMLButtonElement>('.catalog-switch button')[1].click();
      fixture.detectChanges();
    }
    return { fixture, page, entry, setActive };
  }

  it.each(['regular', 'ai'] as const)(
    'demande une confirmation pour %s et n’écrit rien si elle est annulée',
    async (kind) => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { fixture, page, entry, setActive } = await setup(kind);
      page.querySelector<HTMLButtonElement>('.quote-card .remove')!.click();
      await fixture.whenStable();
      expect(confirm).toHaveBeenCalledWith(expect.stringContaining(entry.text));
      expect(setActive).not.toHaveBeenCalled();
      expect(page.querySelectorAll('.quote-card')).toHaveLength(1);
      confirm.mockReturnValue(true);
      page.querySelector<HTMLButtonElement>('.quote-card .remove')!.click();
      await fixture.whenStable();
      expect(setActive).toHaveBeenCalledExactlyOnceWith(entry, false);
      expect(page.textContent).toContain('Citation retirée de la rotation.');
    },
  );

  it('rétablit une citation retirée sans demander de confirmation de retrait', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, page, entry, setActive } = await setup('regular', false);
    page.querySelectorAll<HTMLButtonElement>('.tabs button')[1].click();
    fixture.detectChanges();
    page.querySelectorAll<HTMLButtonElement>('.quote-card .actions button')[1].click();
    await fixture.whenStable();
    expect(confirm).not.toHaveBeenCalled();
    expect(setActive).toHaveBeenCalledExactlyOnceWith(entry, true);
  });
});
