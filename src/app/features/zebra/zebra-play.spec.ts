import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempts } from '../riddles/riddle-attempts';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { ZebraPlay } from './zebra-play';
import { ZEBRA_BLOCKS, ZEBRA_CATEGORIES } from './zebra.model';

describe('indication partielle pour la grille complète', () => {
  async function setup(answerReady = true) {
    const round = signal({ id: 'one', resetAt: 1 });
    const checkGrid = vi.fn().mockResolvedValue(true);
    const submit = vi.fn().mockResolvedValue(false);
    const riddles = signal([
      { id: 'zebra-01', title: 'Zebra', gridReady: true, answerReady, solutions: [] },
    ]);
    const fixture = await TestBed.configureTestingModule({
      imports: [ZebraPlay],
      providers: [
        provideRouter([]),
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            error: signal(''),
            round,
            riddles,
          },
        },
        {
          provide: ParticipantStore,
          useValue: { participant: signal({ id: 'alice', name: 'Alice Roy' }) },
        },
        { provide: RiddleSubmissions, useValue: { submit, checkGrid } },
        {
          provide: RiddleAttempts,
          useValue: { ready: signal(true), error: signal(''), attempts: signal([]) },
        },
      ],
    })
      .compileComponents()
      .then(() => TestBed.createComponent(ZebraPlay));
    await fixture.whenStable();
    return {
      fixture,
      round,
      riddles,
      checkGrid,
      submit,
      page: fixture.nativeElement as HTMLElement,
    };
  }
  afterEach(() => localStorage.clear());
  async function completeGrid(page: HTMLElement) {
    const buttons = [...page.querySelectorAll<HTMLButtonElement>('.cell button')];
    for (const block of ZEBRA_BLOCKS)
      for (let row = 0; row < 4; row++) {
        const transposed = block.column === 'name';
        const rowCategory = transposed ? block.column : block.row;
        const columnCategory = transposed ? block.row : block.column;
        const label = `${ZEBRA_CATEGORIES[rowCategory].values[row]} / ${ZEBRA_CATEGORIES[columnCategory].label} ${ZEBRA_CATEGORIES[columnCategory].values[row]} :`;
        buttons.find((button) => button.getAttribute('aria-label')?.startsWith(label))!.click();
      }
  }
  it('permet d’envoyer la réponse finale avec une grille entièrement vide', async () => {
    const { fixture, page, submit, checkGrid } = await setup();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
    const input = page.querySelector<HTMLInputElement>('input[name="answer"]')!;
    expect(input.disabled).toBe(false);
    input.value = 'MON CODE';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(page.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(submit).toHaveBeenCalledWith('zebra-01', 'MON CODE');
    expect(checkGrid).not.toHaveBeenCalled();
  });
  it('enregistre un essai au clic même si l’ancienne configuration answerReady est fausse', async () => {
    const { fixture, page, submit } = await setup(false);
    const input = page.querySelector<HTMLInputElement>('input[name="answer"]')!;
    const button = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(input.disabled).toBe(false);
    input.value = 'ESSAI';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(submit).toHaveBeenCalledWith('zebra-01', 'ESSAI');
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'ce n’est pas la bonne réponse',
    );
    expect(input.value).toBe('');
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
  });
  it('vérifie automatiquement la grille complète et laisse la résolution finale indépendante', async () => {
    const { fixture, page, checkGrid, submit } = await setup();
    expect(checkGrid).not.toHaveBeenCalled();
    await completeGrid(page);
    await fixture.whenStable();
    expect(checkGrid).toHaveBeenCalledWith('zebra-01', '123412341234123412341234');
    expect(page.querySelector('.grid-status')?.textContent).toContain('Ta grille est correcte');
    expect(submit).not.toHaveBeenCalled();
    expect(page.querySelector('dialog')!.open).toBe(false);
  });
  it('retire le verdict dès qu’une association change et ne revérifie pas une ancienne grille après reset', async () => {
    const { fixture, page, round, checkGrid } = await setup();
    await completeGrid(page);
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('.cell button')!.click();
    await fixture.whenStable();
    expect(page.querySelector('.grid-status')?.textContent).not.toContain('Ta grille est correcte');
    round.set({ id: 'two', resetAt: 2 });
    await fixture.whenStable();
    expect(checkGrid).toHaveBeenCalledTimes(1);
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
  });
});
