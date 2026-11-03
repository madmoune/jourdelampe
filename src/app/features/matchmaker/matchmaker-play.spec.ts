import { TestBed } from '@angular/core/testing';
import { MatchmakerPlay } from './matchmaker-play';

describe('gabarit Matchmaker', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [MatchmakerPlay] }).compileComponents();
    const fixture = TestBed.createComponent(MatchmakerPlay);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  it('affiche les quatorze extraits avec un artiste et deux lettres', async () => {
    const { page } = await setup();
    expect(page.querySelectorAll('.song-row')).toHaveLength(14);
    expect(page.querySelectorAll('.artist-field input')).toHaveLength(14);
    expect(page.querySelectorAll('.letter-field input')).toHaveLength(28);
    expect(page.querySelector('.artist-field input')?.getAttribute('placeholder')).toBe('Artiste');
    expect(page.querySelector('.letter-field input')?.getAttribute('maxlength')).toBe('1');
  });

  it('relie un point gauche à un point droit et remplace une connexion existante', async () => {
    const { fixture, page } = await setup();
    const left = page.querySelectorAll<HTMLButtonElement>('.match-left .match-item');
    const right = page.querySelectorAll<HTMLButtonElement>('.match-right .match-item');

    left[0].click();
    await fixture.whenStable();
    expect(left[0].getAttribute('aria-pressed')).toBe('true');
    right[5].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(1);
    expect(left[0].textContent).toContain('↔ 06');
    expect(right[5].textContent).toContain('01 ↔');

    left[1].click();
    right[5].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(1);
    expect(left[0].textContent).not.toContain('↔');
    expect(right[5].textContent).toContain('02 ↔');
    expect(page.querySelector('.pairing-status')?.textContent).toContain('1 / 14');
  });
});
