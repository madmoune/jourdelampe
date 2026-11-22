import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { PigpenPlay } from './pigpen-play';

describe('jeu des nonogrammes', () => {
  const storageKey = 'jdl-pigpen-v1:alice:one';
  const round = signal({ id: 'one' });

  beforeEach(() => {
    round.set({ id: 'one' });
    localStorage.removeItem(storageKey);
    TestBed.configureTestingModule({
      imports: [PigpenPlay],
      providers: [
        { provide: GameStore, useValue: { round } },
        { provide: ParticipantStore, useValue: { participant: signal({ id: 'alice' }) } },
      ],
    });
  });

  afterEach(() => localStorage.removeItem(storageKey));

  it('affiche le cochon, puis la croix, puis une case vide sans affecter les autres cases', () => {
    const fixture = TestBed.createComponent(PigpenPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const buttons = page.querySelectorAll<HTMLButtonElement>('.cell');
    expect(buttons).toHaveLength(7 * 7 * 7);
    expect(page.querySelector('.pen-heading')).toBeNull();
    expect([...page.querySelectorAll('.pen')].map((pen) => pen.getAttribute('aria-label'))).toEqual(
      ['Enclos 1', 'Enclos 2', 'Enclos 3', 'Enclos 4', 'Enclos 5', 'Enclos 6', 'Enclos 7'],
    );
    expect(page.querySelector('.nonogram-link')).toBeNull();
    const [first, neighbour] = buttons;
    expect(first.getAttribute('aria-label')).toContain('vide');

    first.click();
    fixture.detectChanges();
    expect(first.querySelector('.pig-face')).not.toBeNull();
    expect(first.getAttribute('aria-label')).toContain('cochon');
    expect(neighbour.getAttribute('aria-label')).toContain('vide');

    first.click();
    fixture.detectChanges();
    expect(first.querySelector('.pig-face')).toBeNull();
    expect(first.textContent?.trim()).toBe('×');
    expect(first.getAttribute('aria-label')).toContain('barrée');

    first.click();
    fixture.detectChanges();
    expect(first.textContent?.trim()).toBe('');
    expect(first.getAttribute('aria-label')).toContain('vide');
  });

  it('marque directement une case barrée au clic droit', () => {
    const fixture = TestBed.createComponent(PigpenPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const [first, neighbour] = page.querySelectorAll<HTMLButtonElement>('.cell');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });

    first.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(first.textContent?.trim()).toBe('×');
    expect(first.getAttribute('aria-label')).toContain('barrée');
    expect(neighbour.getAttribute('aria-label')).toContain('vide');

    first.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    fixture.detectChanges();

    expect(first.textContent?.trim()).toBe('');
    expect(first.getAttribute('aria-label')).toContain('vide');
  });

  it('garde les cochons droits dans les sept enclos', () => {
    const boards = Array.from({ length: 7 }, () =>
      Array.from({ length: 49 }, (_, cell) => (cell === 0 ? 'pig' : '')),
    );
    localStorage.setItem(storageKey, JSON.stringify(boards));

    const fixture = TestBed.createComponent(PigpenPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    const pigs = page.querySelectorAll<SVGSVGElement>('.pig-face');
    expect(pigs).toHaveLength(7);
    for (const pig of pigs) {
      expect(pig.style.transform).toBe('');
      expect(pig.hasAttribute('transform')).toBe(false);
    }
  });

  it('se parcourt aux flèches en conservant un seul arrêt de tabulation par enclos', () => {
    const fixture = TestBed.createComponent(PigpenPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const [first, second] = page.querySelectorAll<HTMLButtonElement>('.cell');
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(second);
    expect(first.tabIndex).toBe(-1);
    expect(second.tabIndex).toBe(0);
    expect(page.querySelectorAll('.cell[tabindex="0"]')).toHaveLength(7);
  });

  it('restaure les marques en rouvrant la page et repart à vide dans une nouvelle partie', () => {
    const first = TestBed.createComponent(PigpenPlay);
    first.detectChanges();
    first.nativeElement.querySelector('.cell').click();
    first.destroy();

    const second = TestBed.createComponent(PigpenPlay);
    second.detectChanges();
    const page: HTMLElement = second.nativeElement;
    expect(page.querySelector('.cell.pig')).not.toBeNull();
    round.set({ id: 'two' });
    second.detectChanges();
    expect(page.querySelector('.cell.pig')).toBeNull();
  });

  it('met en évidence un enclos lorsque ses cochons respectent les indices', () => {
    const solved = Array.from({ length: 49 }, (_, index) =>
      index < 7 || index % 7 === 0 || index === 24 ? 'pig' : '',
    );
    localStorage.setItem(
      storageKey,
      JSON.stringify([solved, ...Array.from({ length: 6 }, () => Array(49).fill(''))]),
    );

    const fixture = TestBed.createComponent(PigpenPlay);
    fixture.detectChanges();

    const firstPen: HTMLElement = fixture.nativeElement.querySelector('.pen');
    expect(firstPen.classList).toContain('complete');
    expect(firstPen.querySelector('.completion-badge')?.textContent).toContain('Enclos valide');
  });
});
