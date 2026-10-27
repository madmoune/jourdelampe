import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AiPortalState } from '../ai-home/ai-portal-state';
import { ParticipantStore } from '../riddles/participant-store';
import { ZebraPage } from './zebra-page';
import { ZebraPlay } from './zebra-play';

@Component({ selector: 'app-zebra-play', template: '<p>Grille Zebra accessible</p>' })
class ZebraPlayStub {}

describe('nom géré uniquement dans le portail de l’AI', () => {
  const loading = signal(false);
  const canSolve = signal(false);

  beforeEach(async () => {
    loading.set(false);
    canSolve.set(false);
    await TestBed.configureTestingModule({
      imports: [ZebraPage],
      providers: [
        provideRouter([]),
        {
          provide: ParticipantStore,
          useValue: { loading, canSolve, error: signal('') },
        },
      ],
    })
      .overrideComponent(ZebraPage, {
        remove: { imports: [ZebraPlay] },
        add: { imports: [ZebraPlayStub] },
      })
      .compileComponents();
  });

  it('renvoie vers le portail sans formulaire de nom et sans créer la grille si le nom manque', async () => {
    const fixture = TestBed.createComponent(ZebraPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-zebra-play')).toBeNull();
    expect(page.querySelector('app-riddle-access')).toBeNull();
    expect(page.querySelector('input')).toBeNull();
    const link = page.querySelector<HTMLAnchorElement>('.access-notice a')!;
    expect(link.getAttribute('href')).toBe('/#enigmes');
    link.click();
    expect(TestBed.inject(AiPortalState).revealed()).toBe(true);
  });

  it('ouvre directement la grille pour un nom enregistré, sans gestion de profil', async () => {
    canSolve.set(true);
    const fixture = TestBed.createComponent(ZebraPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-zebra-play')).not.toBeNull();
    expect(page.querySelector('app-riddle-access')).toBeNull();
    expect(page.textContent).not.toContain('Modifier mon nom');
    expect(page.querySelector('.access-notice')).toBeNull();
  });

  it('attend la fin du chargement du profil avant de proposer le retour ou la grille', async () => {
    loading.set(true);
    const fixture = TestBed.createComponent(ZebraPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="status"]')).not.toBeNull();
    expect(page.querySelector('app-zebra-play')).toBeNull();
    expect(page.querySelector('.access-notice a')).toBeNull();
    loading.set(false);
    canSolve.set(true);
    await fixture.whenStable();
    expect(page.querySelector('app-zebra-play')).not.toBeNull();
  });
});
