import { TestBed } from '@angular/core/testing';
import {
  BRAILLE_CODES,
  BRAILLE_VISUALS,
  BINARY_CODES,
  CAESAR_CODES,
  MORSE_CODES,
  MINESWEEPER_EXAMPLE,
  NONOGRAM_COLUMN_CLUES,
  NONOGRAM_EXAMPLE,
  NONOGRAM_ROW_CLUES,
  PIGPEN_CODES,
  PIGPEN_GRIDS,
  resolveCheatsheetBackLink,
  SEMAPHORE_SIGNALS,
  Cheatsheet,
} from './cheatsheet';

describe('règles de base du puzzle hunt', () => {
  it('rappelle les réflexes utiles pour résoudre une énigme', () => {
    const fixture = TestBed.createComponent(Cheatsheet);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('#hunt-rules') as HTMLElement | null;

    expect(section?.querySelector('h2')?.textContent).toBe('Les bases d’un Puzzle Hunt');
    expect(section?.querySelectorAll('li')).toHaveLength(7);
    expect(section?.textContent).toContain('Découvrir la mécanique');
    expect(section?.textContent).toContain('Les règles des jeux classiques ne s’appliquent pas toujours');
    expect(section?.textContent).toContain('fouiller sur Internet');
    expect(section?.textContent).toContain('codes secrets');
    expect(section?.textContent).toContain('méta-énigme finale');
    expect(section?.querySelector('.hunt-rules-takeaway')?.textContent).toContain('À retenir');
  });
});

describe('explications des puzzles', () => {
  it('explique le principe d’une grille Zebra', () => {
    const fixture = TestBed.createComponent(Cheatsheet);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('#zebra') as HTMLElement | null;

    expect(section?.querySelector('h2')?.textContent).toBe('Zebra');
    expect(section?.querySelectorAll('li')).toHaveLength(0);
    expect(section?.textContent).toContain('énigme de logique');
    expect(section?.textContent).toContain('compléter la grille par déductions');
    expect(section?.querySelector('.zebra-demo')).not.toBeNull();
    expect(section?.querySelector('.zebra-demo')?.getAttribute('role')).toBe('img');
  });

  it('définit le nonogram de façon générale', () => {
    const fixture = TestBed.createComponent(Cheatsheet);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('#nonograms') as HTMLElement | null;

    expect(section?.textContent).toContain('grille logique');
    expect(section?.textContent).toContain('cases remplies');
    expect(section?.textContent).not.toContain('cochon');
    expect(section?.querySelector('.nonogram-demo')).not.toBeNull();
  });
});

describe('exemples visuels', () => {
  it('contient un nonogramme et une grille de démineur lisibles', () => {
    expect(NONOGRAM_EXAMPLE).toHaveLength(5);
    expect(NONOGRAM_EXAMPLE.every((row) => row.length === 5)).toBe(true);
    expect(NONOGRAM_ROW_CLUES).toEqual(['1', '3', '1 1', '3', '1']);
    expect(NONOGRAM_COLUMN_CLUES).toEqual(['1', '2 1', '4', '1', '1']);

    expect(MINESWEEPER_EXAMPLE).toHaveLength(25);
    expect(MINESWEEPER_EXAMPLE.filter((cell) => cell.kind === 'flag')).toHaveLength(2);
    expect(MINESWEEPER_EXAMPLE.filter((cell) => cell.kind === 'hidden')).toHaveLength(3);
  });
});

describe('codes de la cheatsheet', () => {
  it('contient les alphabets Morse, braille, binaire et César', () => {
    expect(MORSE_CODES).toHaveLength(26);
    expect(MORSE_CODES[0]).toEqual({ letter: 'A', value: '.-' });
    expect(MORSE_CODES.at(-1)).toEqual({ letter: 'Z', value: '--..' });

    expect(BRAILLE_CODES).toHaveLength(26);
    expect(BRAILLE_CODES[0]).toEqual({ letter: 'A', value: '⠁' });
    expect(BRAILLE_CODES.at(-1)).toEqual({ letter: 'Z', value: '⠵' });
    expect(BRAILLE_VISUALS[0].dots).toEqual([true, false, false, false, false, false]);
    expect(BRAILLE_VISUALS[1].dots).toEqual([true, false, true, false, false, false]);
    expect(BRAILLE_VISUALS[2].dots).toEqual([true, true, false, false, false, false]);
    expect(BRAILLE_VISUALS.at(-1)?.dots).toEqual([true, false, false, true, true, true]);

    expect(BINARY_CODES).toHaveLength(26);
    expect(BINARY_CODES[0]).toEqual({ letter: 'A', value: '01000001' });
    expect(BINARY_CODES.at(-1)).toEqual({ letter: 'Z', value: '01011010' });

    expect(CAESAR_CODES).toHaveLength(26);
    expect(CAESAR_CODES[0]).toEqual({ letter: 'A', value: 'D' });
    expect(CAESAR_CODES.at(-1)).toEqual({ letter: 'Z', value: 'C' });
  });

  it('contient la clé Pigpen complète', () => {
    expect(PIGPEN_CODES).toHaveLength(26);
    expect(
      PIGPEN_CODES.slice(0, 9)
        .map((code) => code.value)
        .join(''),
    ).toBe('┘⊔└┤□├┐⊓┌');
    expect(PIGPEN_CODES.slice(9, 18).every((code) => code.dotted)).toBe(true);
    expect(
      PIGPEN_CODES.slice(18, 22)
        .map((code) => code.value)
        .join(''),
    ).toBe('∨><∧');
    expect(PIGPEN_CODES.slice(22).every((code) => code.dotted)).toBe(true);
    expect(PIGPEN_GRIDS.map((grid) => grid.label)).toEqual(['A–I', 'J–R', 'S–V', 'W–Z']);
    expect(PIGPEN_GRIDS.slice(0, 2).every((grid) => grid.shape === 'square')).toBe(true);
    expect(PIGPEN_GRIDS.slice(2).every((grid) => grid.shape === 'cross')).toBe(true);
    expect(PIGPEN_GRIDS.map((grid) => grid.cells.length)).toEqual([9, 9, 4, 4]);

    const fixture = TestBed.createComponent(Cheatsheet);
    fixture.detectChanges();
    const pigpen = fixture.nativeElement.querySelector('.pigpen-card') as HTMLElement | null;
    expect(pigpen?.querySelectorAll('.pigpen-grid')).toHaveLength(4);
    expect(pigpen?.querySelectorAll('.pigpen-square-grid')).toHaveLength(2);
    expect(pigpen?.querySelectorAll('.pigpen-cross-grid')).toHaveLength(2);
    expect(pigpen?.querySelectorAll('.pigpen-grid-letter')).toHaveLength(26);
    expect(pigpen?.querySelectorAll('.pigpen-dotted-cell')).toHaveLength(13);
    expect(pigpen?.querySelectorAll('.pigpen-grid-dot')).toHaveLength(13);
    expect(pigpen?.querySelector('.pigpen-symbol-shape')).toBeNull();
  });
});

describe('légende du sémaphore', () => {
  it('contient une pose unique pour chaque lettre de A à Z', () => {
    expect(SEMAPHORE_SIGNALS).toHaveLength(26);
    expect(SEMAPHORE_SIGNALS.map((signal) => signal.letter).join('')).toBe(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    );
    expect(new Set(SEMAPHORE_SIGNALS.map((signal) => `${signal.left}:${signal.right}`)).size).toBe(
      26,
    );
  });

  it('miroite le dessin face au lecteur sans inverser les bras du signaleur', () => {
    const fixture = TestBed.createComponent(Cheatsheet);
    fixture.detectChanges();
    const pose = fixture.nativeElement.querySelector('.semaphore-pose') as HTMLElement | null;
    const arms = pose?.querySelectorAll('.pose-arm');

    expect(pose?.getAttribute('aria-label')).toContain('Bras gauche : bas');
    expect(pose?.getAttribute('aria-label')).toContain('Bras droit : bas extérieur');
    expect(arms?.[0].getAttribute('style')).toContain('rotate(135deg)');
    expect(arms?.[1].getAttribute('style')).toContain('rotate(90deg)');
  });
});

describe('lien de retour de la cheatsheet', () => {
  const origin = 'http://localhost:4200';

  it('retourne à l’énigme qui a ouvert la fiche', () => {
    expect(resolveCheatsheetBackLink(`${origin}/apercu-ia/enigmes/la-vigie`, origin)).toBe(
      '/apercu-ia/enigmes/la-vigie',
    );
  });

  it('retourne à la page des énigmes quand elle a ouvert la fiche', () => {
    expect(resolveCheatsheetBackLink(`${origin}/apercu-ia/enigmes`, origin)).toBe(
      '/apercu-ia/enigmes',
    );
  });

  it('ignore une provenance inconnue ou externe', () => {
    expect(resolveCheatsheetBackLink('https://example.com/autre-page', origin)).toBe('/enigmes');
    expect(resolveCheatsheetBackLink('', origin)).toBe('/enigmes');
  });
});
