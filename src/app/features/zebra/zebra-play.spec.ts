import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { ZebraPage } from './zebra-page';
import { ZEBRA_BLOCKS, ZEBRA_CATEGORIES } from './zebra.model';

describe('indication partielle pour la grille complète', () => {
  async function setup(
    answerReady = true,
    gridReady = true,
    gridVerdict = true,
    surnameVerdict = true,
  ) {
    const round = signal({ id: 'one', resetAt: 1 });
    const checkGrid = vi.fn().mockResolvedValue(gridVerdict);
    const checkSurname = vi.fn().mockResolvedValue(surnameVerdict);
    const submit = vi.fn().mockResolvedValue(false);
    const riddles = signal([
      { id: 'zebra-01', title: 'Zebra', gridReady, answerReady, solutions: [] },
    ]);
    const fixture = await TestBed.configureTestingModule({
      imports: [ZebraPage],
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
          useValue: {
            participant: signal({ id: 'alice', name: 'Alice Roy' }),
            loading: signal(false),
            canSolve: signal(true),
            error: signal(''),
          },
        },
        { provide: RiddleSubmissions, useValue: { submit, checkGrid, checkSurname } },
      ],
    })
      .compileComponents()
      .then(() => TestBed.createComponent(ZebraPage));
    await fixture.whenStable();
    return {
      fixture,
      round,
      riddles,
      checkGrid,
      checkSurname,
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
        const columns = block.column === 'position' ? [row * 2, row * 2 + 1] : [row];
        for (const column of columns) {
          const label = `${ZEBRA_CATEGORIES[rowCategory].values[row]} / ${ZEBRA_CATEGORIES[columnCategory].label} ${ZEBRA_CATEGORIES[columnCategory].values[column]} :`;
          buttons.find((button) => button.getAttribute('aria-label')?.startsWith(label))!.click();
        }
      }
  }
  it('permet d’envoyer la réponse finale avec une grille entièrement vide', async () => {
    const { fixture, page, submit, checkGrid } = await setup();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
    const input = page.querySelector<HTMLInputElement>('input[name="answer"]')!;
    const title = page.querySelector('h1')!;
    const flavor = page.querySelector('.flavor-text')!;
    const grid = page.querySelector('app-zebra-grid')!;
    expect(page.querySelector('.grid-success')).toBeNull();
    expect(page.querySelector('.puzzle-heading .eyebrow')).toBeNull();
    expect(page.querySelector('h1 span')).toBeNull();
    expect(page.querySelector('header')?.textContent).not.toContain('DOSSIER');
    expect(page.textContent).not.toContain('OPÉRATION : SAUVER LE PARTY');
    expect(title.compareDocumentPosition(flavor) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(flavor.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(input.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const clues = page.querySelector('.clues')!;
    const information = page.querySelector('.puzzle-information')!;
    expect(grid.contains(clues)).toBe(true);
    expect(grid.querySelector('.grid-workspace')!.firstElementChild).toBe(clues);
    expect(
      grid.compareDocumentPosition(information) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(information.querySelector('.grid-help')).not.toBeNull();
    expect(information.querySelector('.deduction-notes')).not.toBeNull();
    expect(information.querySelector('.legend')).not.toBeNull();
    expect(grid.querySelector('.grid-help')).toBeNull();
    expect(page.querySelector('#grid-title')).toBeNull();
    expect(page.querySelectorAll('input[name="answer"]')).toHaveLength(1);
    expect(page.querySelector('.history')).toBeNull();
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
    const { fixture, page, checkGrid, checkSurname, submit } = await setup();
    expect(checkGrid).not.toHaveBeenCalled();
    await completeGrid(page);
    await fixture.whenStable();
    expect(checkGrid).toHaveBeenCalledWith('zebra-01', '123456781234567812341234567812341234');
    const success = page.querySelector('.grid-success')!;
    expect(success.textContent).toContain('Passe maintenant à l’extraction');
    expect(page.querySelectorAll('.surname-input')).toHaveLength(4);
    expect(page.querySelectorAll('.surname-check')).toHaveLength(0);
    expect(
      [...page.querySelectorAll<HTMLElement>('.surname-entry')].map(
        (entry) => entry.dataset['nameTarget'],
      ),
    ).toEqual(['bob', 'jean-lou', 'eric', 'homer']);
    const bobEntry = page.querySelector<HTMLElement>('[data-name-target="bob"]')!;
    const bobInput = bobEntry.querySelector<HTMLInputElement>('.surname-input')!;
    bobInput.value = 'Brown';
    bobInput.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 350));
    await fixture.whenStable();
    expect(checkSurname).toHaveBeenCalledWith('zebra-01', 'bob', 'Brown');
    expect(bobEntry.querySelector('.surname-correct')?.textContent).toContain('✓');
    expect(
      success.compareDocumentPosition(page.querySelector('app-zebra-grid')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
    expect(page.querySelector('dialog')!.open).toBe(false);
    page.querySelector<HTMLButtonElement>('.clear-grid')!.click();
    await fixture.whenStable();
    expect(page.querySelector('.grid-status')?.textContent).toContain(
      'Complète les 36 associations',
    );
    expect(page.querySelector('.grid-status')?.textContent).not.toContain('Ta grille est correcte');
    expect(page.querySelector('.grid-success')).toBeNull();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
    expect(checkGrid).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });
  it('vérifie la grille complète même sans indicateur de configuration publique', async () => {
    const { fixture, page } = await setup(true, false);
    await completeGrid(page);
    await fixture.whenStable();
    expect(page.querySelector('.grid-success')?.textContent).toContain('Grille validée');
  });
  it('indique au-dessus de la grille quand la grille complète est invalide', async () => {
    const { fixture, page } = await setup(true, false, false);
    await completeGrid(page);
    await fixture.whenStable();
    const error = page.querySelector('.grid-error')!;
    expect(error.textContent).toContain('Grille non valide');
    expect(
      error.compareDocumentPosition(page.querySelector('app-zebra-grid')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(page.querySelector('.grid-success')).toBeNull();
  });
  it('affiche une croix rouge quand un nom de famille est incorrect', async () => {
    const { fixture, page } = await setup(true, false, true, false);
    await completeGrid(page);
    await fixture.whenStable();
    const bobEntry = page.querySelector<HTMLElement>('[data-name-target="bob"]')!;
    const bobInput = bobEntry.querySelector<HTMLInputElement>('.surname-input')!;
    bobInput.value = 'Wrong';
    bobInput.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 350));
    await fixture.whenStable();
    expect(bobEntry.querySelector('.surname-incorrect')?.textContent).toContain('×');
  });
  it('affiche une erreur technique au-dessus de la grille', async () => {
    const { fixture, page, checkGrid } = await setup();
    checkGrid.mockRejectedValue(new Error('Vérification indisponible.'));
    await completeGrid(page);
    await fixture.whenStable();
    const message = page.querySelector('.grid-status .error')!;
    expect(message.textContent).toContain('Vérification indisponible');
    expect(
      message.compareDocumentPosition(page.querySelector('app-zebra-grid')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
  it('retire le verdict dès qu’une association change et ne revérifie pas une ancienne grille après reset', async () => {
    const { fixture, page, round, checkGrid } = await setup();
    await completeGrid(page);
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('.cell button')!.click();
    await fixture.whenStable();
    expect(page.querySelector('.grid-status')?.textContent).not.toContain('Ta grille est correcte');
    expect(page.querySelector('.grid-success')).toBeNull();
    round.set({ id: 'two', resetAt: 2 });
    await fixture.whenStable();
    expect(checkGrid).toHaveBeenCalledTimes(1);
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
  });
});
