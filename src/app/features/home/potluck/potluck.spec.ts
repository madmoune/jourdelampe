import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { PotluckEntry } from '../../../core/models/potluck-entry';
import { PotluckStore } from '../../../core/services/potluck-store';
import { Potluck } from './potluck';

describe('formulaire du potluck', () => {
  async function setup(add: (name: string, dish: string) => Promise<PotluckEntry>) {
    const active = signal<readonly PotluckEntry[]>([]);
    await TestBed.configureTestingModule({
      imports: [Potluck],
      providers: [
        {
          provide: PotluckStore,
          useValue: { add, active, ready: signal(true), loading: signal(false), error: signal('') },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Potluck);
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const name = page.querySelector<HTMLInputElement>('#potluck-name')!;
    const dish = page.querySelector<HTMLInputElement>('#potluck-dish')!;
    name.value = 'Chloé';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    dish.value = 'Lasagne';
    dish.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return { fixture, page, name, dish, active };
  }

  it('confirme après l’enregistrement et affiche le repas reçu en temps réel', async () => {
    let confirm!: (entry: PotluckEntry) => void;
    const pending = new Promise<PotluckEntry>((resolve) => {
      confirm = resolve;
    });
    const { fixture, page, name, dish, active } = await setup(() => pending);
    expect(page.textContent).not.toContain('Ton repas a été ajouté');
    const entry = {
      id: 'meal',
      name: 'Chloé',
      dish: 'Lasagne',
      active: true,
      createdAt: 1,
      updatedAt: 1,
    };
    confirm(entry);
    active.set([entry]);
    await fixture.whenStable();
    expect(page.textContent).toContain('Ton repas a été ajouté au potluck.');
    expect(name.value).toBe('Chloé');
    expect(dish.value).toBe('');
    expect(page.querySelector('.guest-name')?.textContent).toBe('Chloé');
    expect(page.querySelector('.guest-dish')?.textContent).toBe('Lasagne');
  });

  it('conserve le nom et le repas si l’enregistrement échoue', async () => {
    const { fixture, page, name, dish } = await setup(async () => {
      throw new Error('Le repas n’a pas pu être ajouté.');
    });
    await fixture.whenStable();
    expect(page.textContent).toContain('Le repas n’a pas pu être ajouté.');
    expect(name.value).toBe('Chloé');
    expect(dish.value).toBe('Lasagne');
  });
});
