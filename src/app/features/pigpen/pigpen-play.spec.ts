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
});
