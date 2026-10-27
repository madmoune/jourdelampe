import { TestBed } from '@angular/core/testing';
import { ZebraGrid } from './zebra-grid';

describe('grille Zebra cliquable et sauvegardée', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [ZebraGrid] });
  });
  afterEach(() => localStorage.clear());
  it('fait défiler oui, non, vide au clic et libère les cases incompatibles dès le passage à non', async () => {
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.cell button')).toHaveLength(144);
    expect(page.querySelector('.mark-modes')).toBeNull();
    expect(page.querySelectorAll('button')).toHaveLength(144);
    const button = (name: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('.cell button')].find((button) =>
        button.getAttribute('aria-label')?.startsWith(name),
      )!;
    button('Bob / Position 8 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 1 :').disabled).toBe(true);
    expect(button('Jean-Lou / Position 8 :').disabled).toBe(true);
    expect(button('Pilote / Position 8 :').disabled).toBe(false);
    expect(button('Bob / Position 8 :').getAttribute('aria-label')).toContain('associés');
    button('Bob / Position 8 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 1 :').disabled).toBe(false);
    expect(button('Jean-Lou / Position 8 :').disabled).toBe(false);
    expect(button('Bob / Position 8 :').getAttribute('aria-label')).toContain('exclus');
    expect(page.querySelectorAll('.cell.no')).toHaveLength(1);
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(0);
    button('Bob / Position 8 :').click();
    await fixture.whenStable();
    expect(button('Bob / Position 8 :').getAttribute('aria-label')).toContain('à déterminer');
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
  });
  it('retrouve une ancienne association à la bonne intersection après transposition', async () => {
    localStorage.setItem('grid-player-one', JSON.stringify({ 'name-position:0:7': 'yes' }));
    const fixture = TestBed.createComponent(ZebraGrid);
    fixture.componentRef.setInput('storageKey', 'grid-player-one');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('.cell.yes button')?.getAttribute('aria-label')).toBe(
      'Bob / Position 8 : associés',
    );
    expect(page.querySelectorAll('.cell.yes')).toHaveLength(1);
    expect(page.querySelectorAll('.cell.blocked')).toHaveLength(10);
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
});
