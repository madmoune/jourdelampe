import { TestBed } from '@angular/core/testing';
import { AiTransmission } from './ai-transmission';
import { AiQuoteRotation } from './ai-quote-rotation';

describe('transmissions de l’AI', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiTransmission],
      providers: [AiQuoteRotation],
    }).compileComponents();
  });

  it('change l’image, le titre et la sélection accessible de la chaîne', async () => {
    const fixture = TestBed.createComponent(AiTransmission);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const buttons = page.querySelectorAll<HTMLButtonElement>('.channel-buttons button');
    buttons[2].click();
    fixture.detectChanges();
    expect(page.querySelector('.tv-caption strong')?.textContent).toContain('Dans une galaxie');
    expect(page.querySelector('img')?.getAttribute('src')).toBe('images/ai/romano-fafard.jpg');
    expect([...buttons].map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ]);
  });

  it('répond quand on la provoque et permet de rejouer la prise de contrôle', async () => {
    const fixture = TestBed.createComponent(AiTransmission);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const before = page.querySelector('.ai-aside blockquote')!.textContent;
    page.querySelector<HTMLButtonElement>('.provoke-button')!.click();
    fixture.detectChanges();
    expect(page.querySelector('.ai-aside blockquote')!.textContent).not.toBe(before);
    const replay = vi.fn();
    fixture.componentInstance.replay.subscribe(replay);
    page.querySelector<HTMLButtonElement>('.replay-button')!.click();
    expect(replay).toHaveBeenCalledOnce();
  });
});
