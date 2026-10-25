import { TestBed } from '@angular/core/testing';
import { AI_ARCHIVES } from './ai-content';
import { AiQuoteRotation, QUOTE_ROTATION_MS } from './ai-quote-rotation';
import { AiArchives } from './ai-archives';
import { AiTransmission } from './ai-transmission';

describe('rotation des citations télé', () => {
  let rotation: AiQuoteRotation;
  let hidden: boolean;

  beforeEach(() => {
    vi.useFakeTimers();
    hidden = false;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    TestBed.configureTestingModule({ providers: [AiQuoteRotation] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function start(): void {
    rotation = TestBed.inject(AiQuoteRotation);
    TestBed.tick();
  }

  it('contient dix citations distinctes pour chacune des quatre émissions', () => {
    expect(AI_ARCHIVES).toHaveLength(4);
    for (const archive of AI_ARCHIVES) {
      expect(archive.quotes).toHaveLength(10);
      expect(new Set(archive.quotes.map((quote) => quote.text)).size).toBe(10);
      expect(
        archive.quotes.every((quote) => quote.author && quote.text && quote.comment.trim()),
      ).toBe(true);
    }
  });

  it('parcourt les dix citations de chaque émission avant de revenir au début', () => {
    start();
    const seen = AI_ARCHIVES.map(() => new Set<string>());
    for (let index = 0; index < 10; index++) {
      rotation
        .archives()
        .forEach((archive, archiveIndex) => seen[archiveIndex].add(archive.quote.text));
      vi.advanceTimersByTime(QUOTE_ROTATION_MS);
    }
    expect(seen.every((quotes) => quotes.size === 10)).toBe(true);
    expect(rotation.archives().every((archive) => archive.quoteNumber === 1)).toBe(true);
  });

  it('permet de changer une émission manuellement sans modifier les trois autres', () => {
    start();
    rotation.advance(2);
    expect(rotation.archives().map((archive) => archive.quoteNumber)).toEqual([1, 1, 2, 1]);
  });

  it('arrête la rotation en pause et laisse un intervalle complet à la reprise', () => {
    start();
    rotation.paused.set(true);
    TestBed.tick();
    vi.advanceTimersByTime(QUOTE_ROTATION_MS * 2);
    expect(rotation.archives()[0].quoteNumber).toBe(1);
    rotation.paused.set(false);
    TestBed.tick();
    vi.advanceTimersByTime(QUOTE_ROTATION_MS - 1);
    expect(rotation.archives()[0].quoteNumber).toBe(1);
    vi.advanceTimersByTime(1);
    expect(rotation.archives()[0].quoteNumber).toBe(2);
  });

  it('suspend la rotation quand l’onglet est masqué et nettoie son horloge à la destruction', () => {
    start();
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    TestBed.tick();
    vi.advanceTimersByTime(QUOTE_ROTATION_MS);
    expect(rotation.archives()[0].quoteNumber).toBe(1);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    TestBed.tick();
    vi.advanceTimersByTime(QUOTE_ROTATION_MS);
    expect(rotation.archives()[0].quoteNumber).toBe(2);
    TestBed.resetTestingModule();
    vi.advanceTimersByTime(QUOTE_ROTATION_MS);
    expect(rotation.archives()[0].quoteNumber).toBe(2);
  });

  it('privilégie le défilement manuel avec la réduction des animations', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    start();
    vi.advanceTimersByTime(QUOTE_ROTATION_MS);
    expect(rotation.archives()[0].quoteNumber).toBe(1);
    rotation.advance(0);
    expect(rotation.archives()[0].quoteNumber).toBe(2);
  });

  it('synchronise la télé et les encarts et ne présente aucun lien de source', () => {
    const archives = TestBed.createComponent(AiArchives);
    const transmission = TestBed.createComponent(AiTransmission);
    archives.detectChanges();
    transmission.detectChanges();
    const archivePage: HTMLElement = archives.nativeElement;
    const tvPage: HTMLElement = transmission.nativeElement;
    const firstComment = archivePage.querySelector('.archive-comment')?.textContent;
    archivePage.querySelector<HTMLButtonElement>('.quote-controls button')!.click();
    archives.detectChanges();
    transmission.detectChanges();
    expect(archivePage.querySelector('blockquote')?.textContent).toBe(
      tvPage.querySelector('.tv-quotation blockquote')?.textContent,
    );
    expect(archivePage.querySelector('.archive-comment')?.textContent).not.toBe(firstComment);
    expect(archivePage.querySelector('.archive-comment')?.textContent).toContain(
      AI_ARCHIVES[0].quotes[1].comment,
    );
    expect(tvPage.querySelector('.tv-comment')?.textContent).toBe(
      archivePage.querySelector('.archive-comment')?.textContent,
    );
    expect(archivePage.querySelectorAll('a')).toHaveLength(0);
    expect(archivePage.textContent).not.toContain('Source de la citation');
  });
});
