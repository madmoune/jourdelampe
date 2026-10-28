import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AiPortalState } from './features/ai-home/ai-portal-state';
import { RIDDLE_PREVIEW } from './features/riddles/riddle-release';

@Component({ template: '<p>{{ preview ? "Aperçu" : "Public" }}</p>' })
class RouteProbe {
  readonly preview = inject(RIDDLE_PREVIEW);
  readonly portal = inject(AiPortalState);
}

function probeRoutes(config: Routes): Routes {
  return config.map((route) =>
    route.redirectTo !== undefined
      ? route
      : route.children
        ? { ...route, children: probeRoutes(route.children) }
        : { ...route, loadComponent: async () => RouteProbe },
  );
}

describe('ouverture publique et liens de prévisualisation', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-12-31T16:59:59-05:00'));
    TestBed.configureTestingModule({ providers: [provideRouter(probeRoutes(routes))] });
  });

  afterEach(() => vi.restoreAllMocks());

  it('redirige un lien direct vers Zebra avant l’ouverture', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/enigmes/zebra', RouteProbe);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('autorise Zebra dès 17 h à Montréal, soit 22 h UTC', async () => {
    vi.mocked(Date.now).mockReturnValue(Date.parse('2026-12-31T22:00:00Z'));
    const released = await RouterTestingHarness.create();
    await released.navigateByUrl('/enigmes/zebra', RouteProbe);
    expect(TestBed.inject(Router).url).toBe('/enigmes/zebra');
  });

  it('garde l’aperçu dans ses propres routes sans ouvrir le portail public', async () => {
    const harness = await RouterTestingHarness.create();
    const preview = await harness.navigateByUrl('/apercu-ia', RouteProbe);
    expect(preview.preview).toBe(true);
    preview.portal.revealed.set(true);
    const puzzle = await harness.navigateByUrl('/apercu-ia/enigmes/zebra', RouteProbe);
    expect(puzzle.preview).toBe(true);
    expect(puzzle.portal).toBe(preview.portal);
    const home = await harness.navigateByUrl('/apercu-ia#enigmes', RouteProbe);
    expect(home.preview).toBe(true);
    const publicHome = await harness.navigateByUrl('/', RouteProbe);
    expect(publicHome.preview).toBe(false);
    expect(publicHome.portal.revealed()).toBe(false);
  });
});
