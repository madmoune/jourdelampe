import { TestBed } from '@angular/core/testing';
import { ZebraGrid } from './zebra-grid';

describe('grille Zebra cliquable et sauvegardée', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [ZebraGrid] });
  });
  afterEach(() => localStorage.clear());
  it('fait défiler les états et applique les blocages après une ou deux positions cochées', async () => {
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.cell button')).toHaveLength(144);
    expect(page.querySelector('.mark-modes')).toBeNull();
    expect(page.querySelector<HTMLButtonElement>('.clear-grid')?.disabled).toBe(true);
    const button = (name: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('.cell button')].find((button) =>
        button.getAttribute('aria-label')?.startsWith(name),
      )!;
    button('Bob / Position 2 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 1 :').disabled).toBe(false);
    expect(button('Jean-Lou / Position 2 :').disabled).toBe(true);
    expect(button('Pilote / Position 2 :').disabled).toBe(false);
    expect(button('Bob / Position 2 :').getAttribute('aria-label')).toContain('associés');
    button('Bob / Position 11 :').click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(2);
    expect(page.querySelector('.progress')?.textContent).toContain('2 / 36');
    expect(button('Bob / Position 1 :').disabled).toBe(true);
    expect(button('Jean-Lou / Position 11 :').disabled).toBe(true);
    expect(button('Bob / Position 2 :').disabled).toBe(false);
    expect(button('Bob / Position 11 :').disabled).toBe(false);
    expect(page.querySelectorAll('.cell.blocked')).toHaveLength(12);
    button('Bob / Position 11 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 1 :').disabled).toBe(false);
    expect(button('Jean-Lou / Position 11 :').disabled).toBe(false);
    expect(button('Jean-Lou / Position 2 :').disabled).toBe(true);
    expect(page.querySelectorAll('.cell.blocked')).toHaveLength(3);
    button('Bob / Position 11 :').click();
    button('Bob / Position 2 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 1 :').disabled).toBe(false);
    expect(button('Jean-Lou / Position 2 :').disabled).toBe(false);
    expect(button('Bob / Position 2 :').getAttribute('aria-label')).toContain('exclus');
    expect(page.querySelectorAll('.cell.no')).toHaveLength(1);
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
    expect(page.querySelector<HTMLButtonElement>('.clear-grid')?.disabled).toBe(false);
    button('Bob / Position 2 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 2 :').getAttribute('aria-label')).toContain('à déterminer');
    expect(page.querySelectorAll('.cell.no, .cell.yes, .cell.blocked')).toHaveLength(0);
  });
  it('affiche trois blocs en haut, deux au milieu et un en bas avec chaque paire de catégories une seule fois', async () => {
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(
      [...page.querySelectorAll('.group-headings th')].map((cell) => cell.textContent?.trim()),
    ).toEqual(['Position', 'Occupation', 'Nourriture']);
    expect(
      [...page.querySelectorAll('.row-group')].map((cell) => cell.textContent?.trim()),
    ).toEqual(['Nom', 'Nourriture', 'Occupation']);
    const groups = [...page.querySelectorAll('tbody')];
    expect(groups.map((group) => group.querySelectorAll('tr').length)).toEqual([4, 4, 4]);
    expect(
      groups.map((group) => group.querySelector('tr')!.querySelectorAll('.cell').length),
    ).toEqual([16, 12, 8]);
    expect(
      [...page.querySelectorAll('.position-heading')].map((cell) => cell.textContent?.trim()),
    ).toEqual(['1', '4', '5', '11', '18', '6', '3', '2']);
  });
  it('retrouve les deux positions sauvegardées et recalcule leurs blocages', async () => {
    localStorage.setItem(
      'grid-player-one',
      JSON.stringify({ 'name-position:0:1': 'yes', 'name-position:0:7': 'yes' }),
    );
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('.cell.yes button')?.getAttribute('aria-label')).toBe(
      'Bob / Position 4 : associés',
    );
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(2);
    expect(page.querySelectorAll('.cell.blocked')).toHaveLength(12);
  });
  it('réordonne les occupations sans déplacer leurs marques sauvegardées ni leurs coordonnées', async () => {
    localStorage.setItem(
      'grid-player-one',
      JSON.stringify({
        'occupation-name:0:0': 'yes',
        'occupation-position:3:6': 'yes',
        'food-occupation:0:2': 'no',
      }),
    );
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const expectedOrder = ['Étudiant', 'Animateur', 'Pilote', 'Inspecteur'];
    expect(
      [...page.querySelectorAll('.value-headings th')]
        .slice(8, 12)
        .map((cell) => cell.textContent?.trim()),
    ).toEqual(expectedOrder);
    expect(
      [...page.querySelectorAll('tbody:last-of-type .row-label')].map((cell) =>
        cell.textContent?.trim(),
      ),
    ).toEqual(expectedOrder);
    const button = (name: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('.cell button')].find((button) =>
        button.getAttribute('aria-label')?.startsWith(name),
      )!;
    expect(button('Bob / Occupation Pilote :').getAttribute('aria-label')).toContain('associés');
    expect(button('Étudiant / Position 3 :').getAttribute('aria-label')).toContain('associés');
    expect(button('Hot-dog / Occupation Inspecteur :').getAttribute('aria-label')).toContain(
      'exclus',
    );

    button('Bob / Occupation Pilote :').click();
    await fixture.whenStable();
    button('Bob / Occupation Étudiant :').click();
    await fixture.whenStable();
    expect(JSON.parse(localStorage.getItem('grid-player-one')!)).toEqual({
      'occupation-name:0:0': 'no',
      'occupation-name:3:0': 'yes',
      'occupation-position:3:6': 'yes',
      'food-occupation:0:2': 'no',
    });
  });
  it('conserve les blocages dans les blocs sans positions, y compris après transposition', async () => {
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('.cell button')].find((button) =>
        button.getAttribute('aria-label')?.startsWith(name),
      )!;
    button('Bob / Occupation Pilote :').click();
    await fixture.whenStable();
    expect(button('Jean-Lou / Occupation Pilote :').disabled).toBe(true);
    expect(button('Bob / Occupation Étudiant :').disabled).toBe(true);
    expect(button('Bob / Position 11 :').disabled).toBe(false);
    button('Bob / Occupation Pilote :').click();
    await fixture.whenStable();
    expect(button('Jean-Lou / Occupation Pilote :').disabled).toBe(false);
    expect(button('Bob / Occupation Étudiant :').disabled).toBe(false);
  });
  it('retrouve les marques au retour et isole les profils et les parties', async () => {
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector<HTMLButtonElement>('.cell button')!.click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(1);
    fixture.componentRef.setInput('storageKey', 'grid-player-two');
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(1);
  });
  it('vide et sauvegarde la grille courante sans effacer les autres grilles', async () => {
    const otherMarks = JSON.stringify({ 'name-position:1:6': 'yes' });
    localStorage.setItem('grid-player-two', otherMarks);
    localStorage.setItem(
      'grid-player-one',
      JSON.stringify({
        'name-position:0:0': 'yes',
        'name-position:0:1': 'yes',
        'food-occupation:0:1': 'no',
      }),
    );
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    const completed = vi.fn();
    fixture.componentInstance.completed.subscribe(completed);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const clearButton = page.querySelector<HTMLButtonElement>('.clear-grid')!;
    expect(clearButton.disabled).toBe(false);
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(2);
    expect(page.querySelectorAll('.cell.no')).toHaveLength(1);
    expect(page.querySelectorAll('.cell.blocked')).toHaveLength(12);

    clearButton.click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes, .cell.no, .cell.blocked')).toHaveLength(0);
    expect(page.querySelector('.progress')?.textContent).toContain('0 / 36');
    expect(clearButton.disabled).toBe(true);
    expect(JSON.parse(localStorage.getItem('grid-player-one')!)).toEqual({});
    expect(localStorage.getItem('grid-player-two')).toBe(otherMarks);
    expect(completed).toHaveBeenLastCalledWith({ key: 'grid-player-one', code: null });

    fixture.componentRef.setInput('storageKey', 'grid-player-two');
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(1);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    expect(page.querySelectorAll('.cell.yes, .cell.no, .cell.blocked')).toHaveLength(0);
  });
});
