import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameAdminStore } from './game-admin-store';
import { GameDashboard } from './game-dashboard';

describe('tableau de bord protégé et confirmations de remise à zéro', () => {
  async function setup(authorized = false) {
    const access = signal(authorized);
    const reset = vi.fn().mockResolvedValue(undefined);
    const store = {
      session: { authorized: access },
      login: vi.fn(async () => {
        access.set(true);
      }),
      logout: vi.fn(async () => access.set(false)),
      reset,
      error: signal(''),
      loading: signal(false),
      secrets: signal({ a: { answer: 'Réponse secrète', normalizedAnswer: 'REPONSESECRETE' } }),
      game: {
        ready: signal(true),
        error: signal(''),
        solvedCount: signal(1),
        metaUnlocked: signal(true),
        catalog: signal([{ id: 'a' }]),
        riddles: signal([
          {
            id: 'a',
            title: 'La lampe',
            prompt: '',
            order: 0,
            solutions: [
              {
                participantId: 'alice',
                participantName: 'Alice Roy',
                solvedAt: Date.parse('2026-12-31T23:00:00Z'),
              },
              {
                participantId: 'bob',
                participantName: 'Bob Tremblay',
                solvedAt: Date.parse('2026-12-31T23:01:00Z'),
              },
            ],
          },
        ]),
      },
    };
    await TestBed.configureTestingModule({
      imports: [GameDashboard],
      providers: [provideRouter([])],
    })
      .overrideComponent(GameDashboard, {
        set: { providers: [{ provide: GameAdminStore, useValue: store }] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(GameDashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const click = (label: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.trim() === label)!
        .click();
    async function type(id: string, value: string) {
      const input = page.querySelector<HTMLInputElement>(id)!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    }
    return { fixture, page, store, reset, click, type };
  }

  it('ne rend pas les réponses avant la connexion et affiche tous les joueurs après celle-ci', async () => {
    const { fixture, page, type, click, store } = await setup();
    expect(page.textContent).not.toContain('Réponse secrète');
    expect(page.textContent).not.toContain('Alice Roy');
    await type('#game-password', 'test-password');
    click('Ouvrir le tableau de bord');
    await fixture.whenStable();
    expect(store.login).toHaveBeenCalledWith('test-password');
    expect(page.textContent).toContain('Réponse secrète');
    expect(page.textContent).toContain('Alice Roy');
    expect(page.textContent).toContain('Bob Tremblay');
    expect(page.querySelector('time')?.textContent).toContain('18:00:00');
    click('Se déconnecter');
    await fixture.whenStable();
    expect(page.textContent).not.toContain('Réponse secrète');
    expect(page.textContent).not.toContain('Alice Roy');
  });

  it('n’efface rien à la première confirmation, à l’annulation ou sans le texte de deuxième confirmation', async () => {
    const { fixture, page, click, type, reset } = await setup(true);
    click('Réinitialiser le jeu');
    await fixture.whenStable();
    expect(page.textContent).toContain('Confirmation 1 sur 2');
    expect(reset).not.toHaveBeenCalled();
    click('Oui, continuer');
    await fixture.whenStable();
    expect(page.textContent).toContain('Confirmation 2 sur 2');
    expect(reset).not.toHaveBeenCalled();
    await type('#reset-word', 'oui');
    expect(
      [...page.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
        button.textContent?.includes('Confirmer la réinitialisation'),
      )!.disabled,
    ).toBe(true);
    click('Annuler');
    await fixture.whenStable();
    expect(reset).not.toHaveBeenCalled();
    click('Réinitialiser le jeu');
    await fixture.whenStable();
    click('Oui, continuer');
    await fixture.whenStable();
    await type('#reset-word', 'RÉINITIALISER');
    click('Confirmer la réinitialisation');
    await fixture.whenStable();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(page.textContent).toContain('Toutes les énigmes sont à nouveau non résolues.');
  });
});
