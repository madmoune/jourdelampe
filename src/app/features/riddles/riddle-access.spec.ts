import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { RiddleAccess } from './riddle-access';

let puzzleCreations = 0;
@Component({ selector: 'app-test-puzzle', template: '<input aria-label="Réponse à l’énigme" />' })
class TestPuzzle {
  constructor() {
    puzzleCreations++;
  }
}

@Component({
  imports: [RiddleAccess, TestPuzzle],
  template: '<app-riddle-access><ng-template><app-test-puzzle /></ng-template></app-riddle-access>',
})
class TestHost {}

describe('accès aux énigmes par un nom', () => {
  let fixture: ComponentFixture<TestHost>;
  let page: HTMLElement;
  let profiles: BehaviorSubject<unknown>;
  let identities: BehaviorSubject<string | null>;
  let update: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    puzzleCreations = 0;
    profiles = new BehaviorSubject<unknown>(null);
    identities = new BehaviorSubject<string | null>(null);
    update = vi.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        {
          provide: AnonymousSession,
          useValue: {
            watch: () => identities,
            signIn: async () => {
              if (!identities.value) identities.next('player');
              return identities.value!;
            },
          },
        },
        { provide: RealtimeDatabase, useValue: { watch: () => profiles, update } },
      ],
    }).compileComponents();
  });

  async function createPage(): Promise<void> {
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    page = fixture.nativeElement;
  }

  async function enterName(name: string): Promise<void> {
    const input = page.querySelector<HTMLInputElement>('#player-name')!;
    input.value = name;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  function submit(): void {
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('ne crée pas le composant d’énigme tant qu’aucun nom n’est enregistré', async () => {
    await createPage();
    expect(page.textContent).toContain('Avant de jouer, présente-toi.');
    expect(puzzleCreations).toBe(0);
    expect(page.querySelector('[aria-label="Réponse à l’énigme"]')).toBeNull();
    await enterName('   ');
    expect(page.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled).toBe(true);
    submit();
    await fixture.whenStable();
    expect(update).not.toHaveBeenCalled();
    expect(puzzleCreations).toBe(0);
  });

  it('débloque après la sauvegarde et permet de changer ou d’annuler le nom sans recréer l’énigme', async () => {
    await createPage();
    await enterName('Chloé');
    submit();
    await fixture.whenStable();
    expect(page.textContent).toContain('Tu joues sous le nom Chloé');
    expect(puzzleCreations).toBe(1);
    page.querySelector<HTMLButtonElement>('.profile-summary button')!.click();
    await fixture.whenStable();
    const input = page.querySelector<HTMLInputElement>('#player-name')!;
    expect(input.value).toBe('Chloé');
    expect(document.activeElement).toBe(input);
    await enterName('Chloé Martin');
    page.querySelector<HTMLButtonElement>('.text-button')!.click();
    await fixture.whenStable();
    expect(page.textContent).toContain('Tu joues sous le nom Chloé');
    expect(update).toHaveBeenCalledTimes(1);
    page.querySelector<HTMLButtonElement>('.profile-summary button')!.click();
    await fixture.whenStable();
    await enterName('Chloé Martin');
    submit();
    await fixture.whenStable();
    expect(page.textContent).toContain('Tu joues sous le nom Chloé Martin');
    expect(update.mock.calls[1][0]).toBe('participants/player');
    expect(puzzleCreations).toBe(1);
  });

  it('garde le nom saisi et les énigmes fermées en cas d’échec', async () => {
    update.mockRejectedValue(new Error('permission-denied'));
    await createPage();
    await enterName('Chloé');
    submit();
    await fixture.whenStable();
    expect(page.querySelector<HTMLInputElement>('#player-name')!.value).toBe('Chloé');
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'n’a pas pu être enregistré',
    );
    expect(puzzleCreations).toBe(0);
  });
});
