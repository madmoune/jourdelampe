import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { PotluckEntry } from '../../../core/models/potluck-entry';
import { PotluckStore } from '../../../core/services/potluck-store';
import { PotluckManagement } from './potluck-management';

describe('gestion du potluck', () => {
  afterEach(() => vi.restoreAllMocks());

  it('modifie le nom et le repas et permet de retirer puis de rétablir une entrée', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const entry: PotluckEntry = {
      id: 'meal',
      name: 'Sam',
      dish: 'Lasagne',
      active: true,
      createdAt: 1,
      updatedAt: 1,
    };
    const entries = signal<readonly PotluckEntry[]>([entry]);
    const edit = vi.fn().mockResolvedValue(undefined);
    const setActive = vi.fn().mockResolvedValue(undefined);
    const store = {
      entries,
      active: computed(() => entries().filter((item) => item.active)),
      removed: computed(() => entries().filter((item) => !item.active)),
      ready: signal(true),
      loading: signal(false),
      error: signal(''),
      edit,
      setActive,
    };
    await TestBed.configureTestingModule({
      imports: [PotluckManagement],
      providers: [{ provide: PotluckStore, useValue: store }],
    }).compileComponents();
    const fixture = TestBed.createComponent(PotluckManagement);
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector<HTMLButtonElement>('.meal-card .text-button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const name = page.querySelector<HTMLInputElement>('input[name="name"]')!;
    const dish = page.querySelector<HTMLTextAreaElement>('textarea[name="dish"]')!;
    name.value = 'Sam et Alex';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    dish.value = 'Lasagne végétarienne';
    dish.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(edit).toHaveBeenCalledWith(entry, 'Sam et Alex', 'Lasagne végétarienne');
    page.querySelector<HTMLButtonElement>('.meal-card .remove')!.click();
    await fixture.whenStable();
    expect(setActive).toHaveBeenCalledWith(entry, false);
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining(entry.dish));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining(entry.name));
    entries.set([{ ...entry, active: false }]);
    fixture.detectChanges();
    expect(page.querySelectorAll('.meal-card')).toHaveLength(0);
    page.querySelectorAll<HTMLButtonElement>('.tabs button')[1].click();
    fixture.detectChanges();
    expect(page.querySelectorAll('.meal-card')).toHaveLength(1);
    page.querySelectorAll<HTMLButtonElement>('.meal-card .text-button')[1].click();
    await fixture.whenStable();
    expect(setActive).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: entry.id, active: false }),
      true,
    );
    expect(confirm).toHaveBeenCalledOnce();
  });

  it('conserve le repas et n’écrit rien lorsque le retrait est annulé', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const entry: PotluckEntry = {
      id: 'meal',
      name: 'Sam',
      dish: 'Lasagne',
      active: true,
      createdAt: 1,
      updatedAt: 1,
    };
    const entries = signal<readonly PotluckEntry[]>([entry]);
    const setActive = vi.fn();
    await TestBed.configureTestingModule({
      imports: [PotluckManagement],
      providers: [
        {
          provide: PotluckStore,
          useValue: {
            entries,
            active: computed(() => entries().filter((item) => item.active)),
            removed: computed(() => entries().filter((item) => !item.active)),
            ready: signal(true),
            loading: signal(false),
            error: signal(''),
            setActive,
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PotluckManagement);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector<HTMLButtonElement>('.meal-card .remove')!.click();
    await fixture.whenStable();
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Lasagne'));
    expect(setActive).not.toHaveBeenCalled();
    expect(page.querySelectorAll('.meal-card')).toHaveLength(1);
    expect(page.textContent).not.toContain('Repas retiré du potluck.');
  });
});
