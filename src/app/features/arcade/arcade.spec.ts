import { TestBed } from '@angular/core/testing';
import { ArcadeRoom } from './arcade-room';
import { BattleMusic } from './battle-music';
import { BOSS_NAME, planPartyTurn, type PartyAction, startParty } from './combat';
import { cryptBinary, CRYPT_ATTACKS, CRYPT_DAMAGE, stepCrypt, startCrypt, toScreen } from './crypt';
import { DiabloTen } from './diablo-ten';
import { PaperMorsio } from './paper-morsio';
import { LEDGES, LONG_GAP, MARKERS, SHORT_GAP, startMorsio, stepMorsio } from './platformer';
import { finishTrainerTurn, hitTrainer, nearbyTrainer, startTrailBattle, stepTrail, TRAIL_KEYS, TRAIL_START, TRAINERS, type TrainerId } from './trainer-map';

describe('mécaniques des bornes', () => {
  it.each([30, 60, 120])('permet à Morsio de franchir les dix trous à %i images/s', (fps) => {
    let run = startMorsio();
    let jumps = 0;
    for (let frame = 0; frame < 18 * fps && !run.done; frame++) {
      const edge = LEDGES.slice(0, -1).some(
        (ledge) => run.grounded && run.x > ledge.to - 23 && run.x < ledge.to,
      );
      if (edge) jumps++;
      run = stepMorsio(run, 1, edge, 1 / fps);
    }
    expect(run.done).toBe(true);
    expect(jumps).toBe(10);
    expect(run.falls).toBe(0);
    expect(run.checkpoint).toBe(2);
  });

  it('sépare les groupes de trous morse et permet de reprendre à la dernière balise', () => {
    const sections = [''];
    for (const [index, ledge] of LEDGES.slice(1).entries()) {
      const gap = ledge.from - LEDGES[index].to;
      expect([SHORT_GAP, LONG_GAP]).toContain(gap);
      sections[sections.length - 1] += gap === SHORT_GAP ? '.' : '-';
      if (MARKERS.some((marker) => marker > ledge.from && marker < ledge.to)) sections.push('');
    }
    expect(sections).toEqual(['....', '..-', '--.']);
    let run = startMorsio(0, 1);
    for (let frame = 0; frame < 100 && !run.falls; frame++) run = stepMorsio(run, 1, false, 1 / 60);
    expect(run).toEqual(startMorsio(1, 1));
  });

  it('renvoie le morse au départ s’il court dans un trou', () => {
    let run = startMorsio();
    for (let frame = 0; frame < 100 && !run.falls; frame++) {
      run = stepMorsio(run, 1, false, 1 / 60);
    }
    expect(run).toEqual(startMorsio(1));
  });

  it('déplace le héros en temps réel et limite les attaques à leur portée', () => {
    const initial = startCrypt();
    const oneStep = stepCrypt(initial, 1, 0, 'strike', 1 / 60);
    expect(toScreen(oneStep.hero).x).toBeGreaterThan(toScreen(initial.hero).x);
    expect(toScreen(oneStep.hero).y).toBeCloseTo(toScreen(initial.hero).y);
    expect(oneStep.enemy).toBe(initial.enemy);
    let battle = initial;
    for (let frame = 0; frame < 400 && battle.status === 'playing'; frame++) {
      battle = stepCrypt(battle, frame < 68 ? 1 : 0, 0, frame >= 68 ? 'strike' : null, 1 / 60);
    }
    expect(battle.status).toBe('win');
    const won = battle;
    for (let frame = 0; frame < 70; frame++) battle = stepCrypt(battle, 1, 0, 'spell', 1 / 60);
    expect(battle).toMatchObject({ hero: won.hero, hp: won.hp, enemy: 0, effectTime: 0, hit: 0, damage: null });
    expect(stepCrypt(battle, 1, 0, 'spell', 1 / 60)).toBe(battle);
  });

  it('laisse le temps de sortir de la zone du coup du golem', () => {
    let battle = { ...startCrypt(), hero: { x: 50, y: 60 }, golem: { x: 54, y: 55 } };
    battle = stepCrypt(battle, 0, 0, null, 1 / 60);
    expect(battle.windup).toBeGreaterThan(0);
    for (let frame = 0; frame < 42; frame++) battle = stepCrypt(battle, -1, 0, null, 1 / 60);
    expect(battle.hp).toBe(startCrypt().hp);
    expect(battle.message).toContain('esquives');
  });

  it('allonge la portée de l’épée et ne montre des dégâts que sur un coup réussi', () => {
    for (const distance of [30, 31]) {
      const opening = { ...startCrypt(), hero: { x: 30, y: 50 }, golem: { x: 30 + distance, y: 50 }, recovery: 1 };
      let next = stepCrypt(opening, 0, 0, 'strike', 0.04);
      for (let tick = 0; tick < 3; tick++) next = stepCrypt(next, 0, 0, null, 0.04);
      expect(next.enemy).toBe(opening.enemy - (distance === 30 ? CRYPT_DAMAGE.strike : 0));
      expect(next.damage?.action ?? null).toBe(distance === 30 ? 'strike' : null);
    }
  });

  it('applique les dégâts de C et K au moment de l’impact dans Diablo', () => {
    const opening = { ...startCrypt(), hero: { x: 50, y: 60 }, golem: { x: 54, y: 55 } };
    for (const [action, letter] of [['strike', 'C'], ['spell', 'K']] as const) {
      let next = stepCrypt(opening, 0, 0, action, 1 / 60);
      const bits = cryptBinary(CRYPT_DAMAGE[action], 8);
      expect(bits).toMatch(/^[01]{8}$/);
      expect(String.fromCharCode(Number.parseInt(bits, 2))).toBe(letter);
      expect(next.enemy).toBe(opening.enemy);
      expect(next.damage).toBeNull();
      const { impact } = CRYPT_ATTACKS[action];
      for (let age = 0; age < impact - 0.02; age += 0.01) {
        next = stepCrypt(next, 0, 0, null, 0.01);
        expect(next.enemy).toBe(opening.enemy);
      }
      next = stepCrypt(next, 0, 0, null, 0.04);
      expect(opening.enemy - next.enemy).toBe(CRYPT_DAMAGE[action]);
      expect(next.damage?.action).toBe(action);
    }
  });

  it('donne accès aux trois dresseurs par des chemins praticables', () => {
    const queue = [TRAIL_START];
    const visited = new Set<string>();
    const met = new Set<TrainerId>();
    for (const point of queue) {
      const key = `${point.x},${point.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const trainer = nearbyTrainer(point);
      if (trainer) met.add(trainer);
      for (const direction of Object.values(TRAIL_KEYS)) queue.push(stepTrail(point, ...direction));
    }
    expect(met).toEqual(new Set(['A', 'B', 'C']));
    expect(nearbyTrainer(TRAIL_START)).toBeNull();
    expect(stepTrail(TRAIL_START, -1, 0)).toBe(TRAIL_START);
  });

  it('affiche le nom chiffré et applique neuf dégâts par attaque jusqu’à la victoire', () => {
    const decoded = [...BOSS_NAME].map((letter) =>
      String.fromCharCode(65 + (letter.charCodeAt(0) - 65 + 26 - 9) % 26)).join('');
    expect(decoded).toBe('MAN');
    const opening = planPartyTurn(startParty(), 'spell')!.end;
    expect(opening.actor).toBe(1);
    expect(opening.mp).toEqual([5, 5]);
    expect(startParty().enemy - opening.enemy).toBe(9);
    const reply = planPartyTurn(opening, 'spell')!;
    expect(reply.hit.hp[1]).toBe(42);
    expect(reply.targets).toEqual([1]);
    expect(reply.end.actor).toBe(0);
    expect(reply.end.hp[1]).toBe(33);
    const nearEnd = Array<PartyAction>(8).fill('strike').reduce(
      (battle, action) => planPartyTurn(battle, action)!.end, startParty(),
    );
    expect(nearEnd.enemy).toBe(9);
    const win = planPartyTurn(nearEnd, 'strike')!.end;
    expect(win.status).toBe('win');
    expect(planPartyTurn(win, 'spell')).toBeNull();
    expect(planPartyTurn({ ...startParty(), mp: [1, 5] }, 'spell')).toBeNull();
    const loss = planPartyTurn({ ...startParty(), hp: [0, 1], actor: 1 }, 'strike')!.end;
    expect(loss.status).toBe('loss');
    expect(planPartyTurn(loss, 'strike')).toBeNull();
  });

  it.each([
    ['A', [true, false, true, true, false, false]],
    ['B', [false, true, true, true, false, false]],
    ['C', [true, false, false, false, false, false]],
  ] as const)('fait combattre seulement les créatures dans les cases pleines du dresseur %s', (trainer, pattern) => {
    expect(TRAINERS[trainer].slots.map((slot) => !!slot)).toEqual(pattern);
    const expected = pattern.flatMap((occupied, index) => occupied ? [index] : []);
    const faced = new Set<number>();
    let fight = startTrailBattle(trainer);
    for (let turn = 0; turn < 12 && fight.hp && fight.enemy; turn++) {
      faced.add(fight.active);
      fight = finishTrainerTurn(hitTrainer(fight, fight.enemy > 8 && !!fight.sparks));
    }
    expect(fight.hp).toBeGreaterThan(0);
    expect(fight.enemy).toBe(0);
    expect([...faced]).toEqual(expected);
  });
});

it('affiche les poses et les dégâts binaires de Diablo et présente les jauges sans chiffres', () => {
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  const tick = (time: number) => {
    for (const id of [...frames.keys()]) {
      const callback = frames.get(id);
      frames.delete(id);
      callback?.(time);
    }
  };
  const fixture = TestBed.createComponent(DiabloTen);
  try {
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const console = page.querySelector('.console')!;
    const gauges = [...page.querySelectorAll('.golem-health, .orb')];
    expect(gauges.map((gauge) => gauge.textContent?.trim())).toEqual(['Golem de cendre', 'PV', 'PM']);

    page.querySelector<HTMLButtonElement>('[aria-label="A · Frapper"]')!.click();
    tick(100);
    fixture.detectChanges();
    const swing = () => page.querySelector('[data-action="strike"]');
    expect(swing()?.getAttribute('visibility')).toBe('visible');
    expect(swing()?.getAttribute('viewBox')).toBe('0 0 110 100');
    for (let time = 120; time <= 220; time += 20) tick(time);
    fixture.detectChanges();
    expect(swing()?.getAttribute('viewBox')).toBe('110 0 110 100');
    expect(page.querySelector('.last-attack')?.textContent).toContain('01000011');
    expect(page.querySelector('.damage-popup')).toBeNull();

    for (let time = 240; time <= 500; time += 20) tick(time);
    page.querySelector<HTMLButtonElement>('[aria-label="B · Sort"]')!.click();
    const right = { key: 'ArrowRight', code: 'ArrowRight', bubbles: true };
    console.dispatchEvent(new KeyboardEvent('keydown', right));
    tick(520);
    fixture.detectChanges();
    expect(swing()?.getAttribute('visibility')).toBe('hidden');
    expect(page.querySelector('[data-action="spell"]')?.getAttribute('visibility')).toBe('visible');
    expect(page.querySelector('.ember')).not.toBeNull();
    expect(page.querySelector('.last-attack')?.textContent).toContain('01001011');
    for (let time = 540; time <= 1260; time += 20) tick(time);
    fixture.detectChanges();
    expect(page.querySelector('.damage-popup')?.textContent).toBe('01001011');

    console.dispatchEvent(new KeyboardEvent('keyup', right));
    page.querySelector<HTMLButtonElement>('[aria-label="A · Frapper"]')!.click();
    tick(1280);
    fixture.detectChanges();
    expect(page.querySelector('.last-attack')?.textContent).toContain('01000011');
    expect(page.querySelector('.damage-popup')?.textContent).toBe('01001011');
    for (let time = 1300; time <= 1420; time += 20) tick(time);
    fixture.detectChanges();
    expect(page.querySelector('.verdict')?.textContent).toContain('La lame fend la pierre');
    expect(page.querySelector('.damage-popup')?.textContent).toBe('01000011');
  } finally {
    fixture.destroy();
    raf.mockRestore();
    cancel.mockRestore();
  }
});

describe('musique de combat', () => {
  it('programme les notes après activation et ferme le son à l’arrêt', async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const osc = {
      frequency: { value: 0 },
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn().mockReturnValue({ connect: vi.fn() }),
      disconnect: vi.fn(),
    };
    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      disconnect: vi.fn(),
    };
    const browser = {
      AudioContext: class {
        readonly currentTime = 0;
        readonly state = 'running';
        resume = vi.fn().mockResolvedValue(undefined);
        createOscillator = vi.fn().mockReturnValue(osc);
        createGain = vi.fn().mockReturnValue(gain);
        close = close;
      },
      setInterval: vi.fn().mockReturnValue(8),
      clearInterval: vi.fn(),
    };
    const music = new BattleMusic(browser as unknown as Window & typeof globalThis);
    expect(osc.start).not.toHaveBeenCalled();
    await music.start();
    expect(osc.start).toHaveBeenCalled();
    expect(browser.setInterval).toHaveBeenCalledOnce();
    music.stop();
    expect(browser.clearInterval).toHaveBeenCalledWith(8);
    expect(close).toHaveBeenCalledOnce();
  });
});

describe('salle d’arcade', () => {
  const key = 'jdl-arcade-v1:anonymous:preview';
  const savedWins = '["morsio","diablo","trainers","fantaceasar"]';
  afterEach(() => localStorage.removeItem(key));

  it('affiche le format de réponse sous le choix des jeux et laisse jouer les quatre bornes', () => {
    localStorage.setItem(key, savedWins);
    const fixture = TestBed.createComponent(ArcadeRoom);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const choices = page.querySelectorAll<HTMLButtonElement>('.cabinets button');
    expect([...choices].map((choice) => choice.textContent?.trim())).toEqual([
      'Paper Morsio', 'Pokemon Gold & Blind', 'Diablo 10', 'Final Fantaceasar 9',
    ]);
    expect([...choices].map((choice) => choice.querySelector('.cabinet-art')?.getAttribute('data-art')))
      .toEqual(['morsio', 'trainers', 'diablo', 'fantaceasar']);
    const patterns = () => [...choices].map((choice) => choice.nextElementSibling?.textContent?.trim());
    expect(patterns()).toEqual(['???', '???', '??', '???']);
    expect(page.querySelector('.counter, .complete, .all-clear')).toBeNull();
    expect(page.querySelector('app-paper-morsio')).not.toBeNull();
    const frame = page.querySelector('.cabinet-screen')!;
    expect([...frame.children].map((child) => child.tagName)).toEqual(['H2', 'APP-PAPER-MORSIO']);
    choices[2].click();
    fixture.detectChanges();
    expect(page.querySelector('app-diablo-ten app-arcade-gamepad')).not.toBeNull();
    choices[1].click();
    fixture.detectChanges();
    const gold = page.querySelector('app-gold-blind')!;
    const console = gold.querySelector<HTMLElement>('.console')!;
    const field = gold.querySelector('[data-arcade-playfield]')!;
    const press = (label: string) => {
      gold.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
      fixture.detectChanges();
    };
    const mouse = (button: number, target: Element = field, pointerType = 'mouse') => {
      const options = { bubbles: true, cancelable: true, pointerId: 1, pointerType, button };
      target.dispatchEvent(new PointerEvent('pointerdown', { ...options, buttons: button === 2 ? 2 : 1 }));
      target.dispatchEvent(new PointerEvent('pointerup', options));
      fixture.detectChanges();
    };
    expect(document.activeElement).toBe(console);
    const walk = { key: 'S', code: 'KeyS', bubbles: true };
    console.dispatchEvent(new KeyboardEvent('keydown', walk));
    console.dispatchEvent(new KeyboardEvent('keyup', walk));
    fixture.detectChanges();
    expect(gold.textContent).toContain('Sauge est à côté');
    mouse(0, field, 'touch');
    expect(gold.querySelector('[aria-label="A · Combattre"]')).toBeNull();
    mouse(0, console);
    expect(gold.querySelector('[aria-label="A · Combattre"]')).toBeNull();
    mouse(0);
    expect(gold.querySelector('[aria-label="A · Combattre"]')).not.toBeNull();
    mouse(2);
    expect(gold.querySelector('[aria-label="A · Combattre"]')).toBeNull();
    const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
    expect(field.dispatchEvent(menu)).toBe(false);
    expect(console.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true, cancelable: true, button: 2,
    }))).toBe(true);
    mouse(0);
    mouse(0);
    const slots = () => [...gold.querySelectorAll('.roster li')].map((slot) => !!slot.querySelector('img'));
    expect(slots()).toEqual([true, false, true, true, false, false]);
    vi.useFakeTimers();
    try {
      press('A · Valider');
      press('A · Valider');
      expect(gold.querySelector('.attack-sprite')?.getAttribute('viewBox')).toBe('0 0 56 54');
      vi.advanceTimersByTime(95);
      fixture.detectChanges();
      expect(gold.querySelector('.hero-sprite.lunge')).not.toBeNull();
      expect(gold.querySelector('.rival progress')?.getAttribute('value')).toBe('8');
      vi.advanceTimersByTime(165 + 180);
      fixture.detectChanges();
      expect(gold.querySelectorAll('.roster li.ko')).toHaveLength(1);
      expect(gold.querySelector('.rival label')?.textContent).toContain('Frilièvre');
      expect(slots()).toEqual([true, false, true, true, false, false]);

      press('A · Valider');
      vi.advanceTimersByTime(95 + 165 + 180);
      fixture.detectChanges();
      expect(gold.querySelector('.rival-sprite.lunge')).not.toBeNull();
      expect(gold.querySelector('.hp.hero small')?.textContent).toContain('32 / 32');
      vi.advanceTimersByTime(185 + 180);
      fixture.detectChanges();
      expect(gold.querySelector('.hp.hero small')?.textContent).toContain('29 / 32');

      press('Droite');
      press('A · Valider');
      vi.advanceTimersByTime(165);
      fixture.detectChanges();
      expect(gold.querySelector('.spark.flying')).not.toBeNull();
      mouse(2);
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(gold.querySelector('.map')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
    choices[3].click();
    fixture.detectChanges();
    const fantaceasar = page.querySelector('app-final-fantaceasar')!;
    expect(fantaceasar.querySelector('.boss-hp')?.textContent?.trim()).toBe(BOSS_NAME);
    expect(fantaceasar.textContent).toContain('Musique · coupée');
    expect(fantaceasar.querySelectorAll('.commands button')).toHaveLength(2);
    expect(fantaceasar.querySelector('.enemy-position')?.getAttribute('transform')).toBe('translate(132 171)');
    expect(fantaceasar.querySelector('.party-position')?.getAttribute('transform')).toBe('translate(336 185)');
    const action = fantaceasar.querySelector<HTMLButtonElement>('button[aria-label="A · Valider"]')!;
    const strike = fantaceasar.querySelectorAll<HTMLButtonElement>('.commands button')[0];
    const magic = fantaceasar.querySelectorAll<HTMLButtonElement>('.commands button')[1];
    vi.useFakeTimers();
    try {
      magic.click();
      fixture.detectChanges();
      expect(fantaceasar.querySelector('.bolt')).not.toBeNull();
      expect(fantaceasar.querySelector('.boss-hp progress')?.getAttribute('value')).toBe('81');
      vi.advanceTimersByTime(330);
      fixture.detectChanges();
      expect(fantaceasar.querySelector('.boss-hp progress')?.getAttribute('value')).toBe('72');
      expect(fantaceasar.querySelector('.arena text.impact')?.textContent).toBe('−9');
      vi.advanceTimersByTime(235);
      fixture.detectChanges();
      strike.click();
      fixture.detectChanges();
      expect(fantaceasar.querySelector('.party-fighter.lunge')).not.toBeNull();
      vi.advanceTimersByTime(280 + 235 + 155);
      fixture.detectChanges();
      expect(fantaceasar.querySelector('.counter-sprite[visibility="visible"]')).not.toBeNull();
      expect(fantaceasar.querySelector('.bolt.counter')).not.toBeNull();
      vi.runAllTimers();
      fixture.detectChanges();
      for (let turn = 2; turn < 9; turn++) {
        action.click();
        vi.runAllTimers();
        fixture.detectChanges();
      }
    } finally {
      vi.useRealTimers();
    }
    expect(fantaceasar.querySelector('.result')?.textContent).toContain('Victoire');
    choices[0].click();
    fixture.detectChanges();
    expect(choices[3].textContent?.trim()).toBe('Final Fantaceasar 9');
    expect(patterns()).toEqual(['???', '???', '??', '???']);
    expect(localStorage.getItem(key)).toBe(savedWins);
  });
});

it('gère deux doigts à la fois pour avancer et sauter, puis libère la direction annulée', () => {
  let tick: FrameRequestCallback = () => {};
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    tick = callback;
    return 1;
  });
  const fixture = TestBed.createComponent(PaperMorsio);
  try {
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const right = page.querySelector('[aria-label="Droite"]')!;
    const jump = page.querySelector('[aria-label="A · Sauter"]')!;
    const touch = (target: Element, type: string, id: number) => target.dispatchEvent(
      new PointerEvent(type, { bubbles: true, button: 0, pointerId: id, pointerType: 'touch' }),
    );
    const position = () => page.querySelector('.morse')?.getAttribute('transform')
      ?.match(/^translate\(([^ ]+) ([^)]+)\)/)?.slice(1).map(Number) ?? [];

    touch(right, 'pointerdown', 1);
    touch(jump, 'pointerdown', 2);
    tick(100);
    fixture.detectChanges();
    const [x, y] = position();
    expect(x).toBeGreaterThan(startMorsio().x);
    expect(y).toBeLessThan(startMorsio().y);
    touch(jump, 'pointerup', 2);
    touch(right, 'pointercancel', 1);
    tick(117);
    fixture.detectChanges();
    expect(position()[0]).toBe(x);
  } finally {
    fixture.destroy();
    raf.mockRestore();
  }
});
