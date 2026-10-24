import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AI_QUOTES } from '../../core/config/ai-quotes.config';
import { CONTENT } from '../../core/config/content.config';
import { QuotesStore } from '../../core/services/quotes-store';
import { PotluckStore } from '../../core/services/potluck-store';
import { Home } from './home';
import { TitleLights } from './lamp-title/title-lights';
import { QuoteDeck } from './quote-deck';

describe('accueil', () => {
  let fixture: ComponentFixture<Home>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: QuotesStore, useValue: { add: vi.fn() } },
        {
          provide: PotluckStore,
          useValue: {
            active: signal([]),
            ready: signal(true),
            loading: signal(false),
            error: signal(''),
          },
        },
      ],
    })
      .overrideComponent(Home, {
        set: {
          providers: [
            {
              provide: QuoteDeck,
              useValue: {
                quotes: signal([AI_QUOTES[0], CONTENT.quotes[5], ...CONTENT.quotes.slice(0, 4)]),
              },
            },
          ],
        },
      })
      .compileComponents();
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    page = fixture.nativeElement;
  });

  it('allume les 13 lettres indépendamment, y compris les lettres identiques', () => {
    const lamps = page.querySelectorAll<HTMLButtonElement>('.letter-lamp');
    expect(lamps).toHaveLength(13);
    expect([...lamps].every((lamp) => lamp.getAttribute('aria-pressed') === 'true')).toBe(true);

    // Le E de « LE » ne doit pas changer les E de « DE » ou de « LAMPE ».
    lamps[1].click();
    fixture.detectChanges();
    expect(lamps[1].getAttribute('aria-pressed')).toBe('false');
    expect(lamps[7].getAttribute('aria-pressed')).toBe('true');
    expect(lamps[12].getAttribute('aria-pressed')).toBe('true');

    lamps[7].click();
    fixture.detectChanges();
    expect(TestBed.inject(TitleLights).pattern()).toBe('1011111011111');

    lamps[1].click();
    lamps[7].click();
    fixture.detectChanges();
    expect(TestBed.inject(TitleLights).pattern()).toBe('1111111111111');
    expect([...lamps].every((lamp) => lamp.getAttribute('aria-pressed') === 'true')).toBe(true);
  });

  it('ferme le menu après la navigation et avec la touche Échap', () => {
    const toggle = page.querySelector<HTMLButtonElement>('.menu-toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    page.querySelector<HTMLAnchorElement>('.navigation a')!.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('partage le tirage entre les six pastilles et le garde pendant la visite', () => {
    const quotes = fixture.debugElement.injector.get(QuoteDeck).quotes();
    const badges = [...page.querySelectorAll<HTMLElement>('app-quote-badge')];
    expect(badges).toHaveLength(6);

    const renderedQuotes = [quotes[1], quotes[0], ...quotes.slice(2)];
    renderedQuotes.forEach((quote, index) => {
      const badge = badges[index];
      expect(badge.querySelector('.quote-text')?.textContent).toBe(quote.text);
      expect(badge.querySelector('cite')?.textContent?.trim()).toBe(
        quote.author ? `— ${quote.author}` : undefined,
      );
      if (quote.href) {
        const link = badge.querySelector('a')!;
        expect(link.getAttribute('href')).toBe(quote.href);
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    });
    expect(page.querySelector('.art-sticker cite')?.textContent?.trim()).toBe('— AI');
    expect(page.querySelectorAll('app-quote-badge cite')).toHaveLength(1);

    const before = badges.map((badge) => badge.textContent);
    page.querySelector<HTMLButtonElement>('.letter-lamp')!.click();
    page.querySelector<HTMLButtonElement>('.menu-toggle')!.click();
    fixture.detectChanges();
    expect(badges.map((badge) => badge.textContent)).toEqual(before);
  });

  it('ne contient aucun lien vers la page de gestion', () => {
    expect(
      [...page.querySelectorAll('a')].some((link) =>
        link.getAttribute('href')?.includes('maintenance'),
      ),
    ).toBe(false);
  });
});
