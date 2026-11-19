import { TestBed } from '@angular/core/testing';
import { RiddleResults } from './riddle-results';

describe('résolutions affichées sur la carte d’une énigme', () => {
  it('affiche chaque nom et son heure de résolution à Montréal', async () => {
    const fixture = TestBed.createComponent(RiddleResults);
    fixture.componentRef.setInput(
      'solutions',
      ['Alice', 'Bob'].map((name) => ({
        participantId: name.toLowerCase(),
        participantName: name,
        riddleId: 'a',
        riddleTitle: 'La lampe',
        roundId: 'one',
        solvedAt: Date.parse('2026-12-31T23:00:00Z'),
      })),
    );
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect([...page.querySelectorAll('strong')].map((node) => node.textContent)).toEqual([
      'Alice',
      'Bob',
    ]);
    const time = page.querySelector('time');
    expect(time?.textContent?.trim()).toBe('2026-12-31 18:00:00');
    expect(time?.getAttribute('datetime')).toBe('2026-12-31T23:00:00.000Z');
  });
});
