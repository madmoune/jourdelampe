import { TestBed } from '@angular/core/testing';
import { MATCHMAKER_CLUES } from './matchmaker-clues';
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
    expect(page.querySelectorAll('.song-excerpt audio')).toHaveLength(14);
    expect(page.querySelectorAll('.artist-field input')).toHaveLength(14);
    expect(page.querySelectorAll('.letter-field input')).toHaveLength(28);
    expect(page.querySelector('.artist-field input')?.getAttribute('placeholder')).toBe('Artiste');
    expect(page.querySelector('.letter-field input')?.getAttribute('maxlength')).toBe('1');
  });

  it('associe chaque ligne à son fichier audio public', async () => {
    const { page } = await setup();
    const audio = page.querySelectorAll<HTMLAudioElement>('.song-excerpt audio');

    expect(audio[0]?.getAttribute('src')).toBe('audio/matchmaker/5s/1.mp3');
    expect(audio[13]?.getAttribute('src')).toBe('audio/matchmaker/5s/14.mp3');
    expect(audio[0]?.controls).toBe(true);
  });

  it('confirme le bon artiste pour chaque extrait et retire le crochet après une modification', async () => {
    const { fixture, page } = await setup();
    const fields = [...page.querySelectorAll('.artist-field')];
    const artists = [
      ' la  chicane ',
      'The Offspring',
      'Martin Deschamps',
      'Sum-41',
      'Britney Spears',
      'Garou',
      'Eminem',
      'Limp Bizkit',
      'ERIC LAPOINTE',
      '3 Doors Down',
      'Red Hot Chili Peppers',
      'Musiq Soulchild',
      'Louise Attaque',
      'Linkin Park',
    ];
    const enterArtist = (index: number, name: string) => {
      const field = fields[index].querySelector('input')!;
      field.value = name;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const marks = () =>
      fields.map((field) => field.querySelector('.artist-mark [aria-hidden]')?.textContent ?? '');

    expect(marks()).toEqual(Array(artists.length).fill(''));
    artists.forEach((artist, index) => enterArtist(index, artist));
    await fixture.whenStable();
    expect(marks()).toEqual(Array(artists.length).fill('✓'));
    expect(fields[0].querySelector('[role="status"] .sr-only')?.textContent).toBe('Artiste correct');

    enterArtist(0, 'The Offspring');
    enterArtist(1, '');
    enterArtist(11, 'Musiq');
    await fixture.whenStable();
    expect(marks().slice(0, 2)).toEqual(['', '']);
    expect(marks().slice(2)).toEqual(Array(artists.length - 2).fill('✓'));
  });

  it('affiche 14 débuts et 14 fins, dont la phrase de Britney Spears', async () => {
    const { page } = await setup();
    const starts = page.querySelectorAll('.match-left .match-text');
    const ends = page.querySelectorAll('.match-right .match-text');

    expect(starts).toHaveLength(14);
    expect(ends).toHaveLength(14);
    const britneyStart = [...starts].find((text) => text.textContent?.trim() === 'I think I did it again');
    expect(britneyStart).toBeDefined();
    for (const text of [...starts, ...ends]) {
      expect(text.textContent?.trim().split(/\s+/u)).toHaveLength(text === britneyStart ? 6 : 5);
    }
  });

  it('fait passer les bonnes associations par leurs deux indices uniquement', async () => {
    const { fixture, page } = await setup();
    const left = page.querySelectorAll<HTMLButtonElement>('.match-left');
    const right = page.querySelectorAll<HTMLButtonElement>('.match-right');
    const markers = [...page.querySelectorAll<HTMLElement>('.pair-index')].map((marker) => ({
      x: Number.parseFloat(marker.style.left),
      y: Number.parseFloat(marker.style.top),
      value: marker.textContent?.trim(),
    }));

    expect(
      [...page.querySelectorAll('.pairing-labels span')].map((label) => label.textContent),
    ).toEqual(['Début', 'Fin']);
    expect(markers).toHaveLength(40);
    expect(markers.filter(({ x }) => x < 50)).toHaveLength(20);
    expect(markers.filter(({ x }) => x > 50)).toHaveLength(20);

    // Dimensions minimales du centre et des rangées, avec les pastilles de 22 px.
    const width = 100;
    const height = 14 * 52;
    for (const [index, marker] of markers.entries()) {
      for (const other of markers.slice(index + 1)) {
        const dx = ((marker.x - other.x) * width) / 100;
        const dy = ((marker.y - other.y) * height) / 100;
        expect(Math.hypot(dx, dy)).toBeGreaterThan(22);
      }
    }

    for (const [startRow, { endRow }] of MATCHMAKER_CLUES.entries()) {
      expect(Math.abs(endRow - startRow)).toBeGreaterThanOrEqual(3);
      left[startRow].click();
      right[endRow].click();
    }
    await fixture.whenStable();

    const lines = [...page.querySelectorAll('.pair-lines line')];
    expect(lines).toHaveLength(14);
    for (const [index, line] of lines.entries()) {
      const y1 = Number(line.getAttribute('y1'));
      const y2 = Number(line.getAttribute('y2'));
      const slope = ((y2 - y1) * height) / (100 * width);
      const crossed = markers
        .filter(({ x, y }) => {
          const lineY = y1 + ((y2 - y1) * x) / 100;
          const distance = (Math.abs(y - lineY) * height) / (100 * Math.hypot(1, slope));
          return distance <= 12;
        })
        .sort((a, b) => a.x - b.x);
      expect(crossed.map(({ value }) => value)).toEqual(MATCHMAKER_CLUES[index].indices.map(String));
      expect(crossed[0].x).toBeLessThan(50);
      expect(crossed[1].x).toBeGreaterThan(50);
    }
  });

  it('relie un point gauche à un point droit et remplace une connexion existante', async () => {
    const { fixture, page } = await setup();
    const left = page.querySelectorAll<HTMLButtonElement>('.match-left');
    const right = page.querySelectorAll<HTMLButtonElement>('.match-right');

    left[0].click();
    await fixture.whenStable();
    expect(left[0].getAttribute('aria-pressed')).toBe('true');
    right[5].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(1);
    expect(left[0].textContent).toContain('↔ 06');
    expect(right[5].textContent).toContain('01 ↔');

    left[0].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(0);

    left[0].click();
    right[5].click();
    await fixture.whenStable();

    left[1].click();
    right[5].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(1);
    expect(left[0].textContent).not.toContain('↔');
    expect(right[5].textContent).toContain('02 ↔');
    expect(page.querySelectorAll('.match-item.connected')).toHaveLength(2);

    right[5].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(0);
    expect(page.querySelectorAll('.match-item.connected')).toHaveLength(0);
  });

  it('annule le point sélectionné quand on clique ailleurs', async () => {
    const { fixture, page } = await setup();
    const left = page.querySelectorAll<HTMLButtonElement>('.match-left');
    left[0].click();
    await fixture.whenStable();
    expect(left[0].getAttribute('aria-pressed')).toBe('true');
    page.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(left[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('vide toutes les connexions avec le bouton dédié', async () => {
    const { fixture, page } = await setup();
    const left = page.querySelectorAll<HTMLButtonElement>('.match-left');
    const right = page.querySelectorAll<HTMLButtonElement>('.match-right');
    const clear = page.querySelector<HTMLButtonElement>('.clear-links')!;
    expect(clear.disabled).toBe(true);
    left[0].click();
    right[1].click();
    await fixture.whenStable();
    expect(clear.disabled).toBe(false);
    clear.click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.pair-lines line')).toHaveLength(0);
    expect(page.querySelectorAll('.match-item.connected')).toHaveLength(0);
    expect(clear.disabled).toBe(true);
  });
});
