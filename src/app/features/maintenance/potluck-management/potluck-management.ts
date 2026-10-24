import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { PotluckEntry } from '../../../core/models/potluck-entry';
import { PotluckStore } from '../../../core/services/potluck-store';
import { POTLUCK_DISH_MAX_LENGTH, POTLUCK_NAME_MAX_LENGTH } from '../../../core/utils/potluck';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-potluck-management',
  imports: [FormsModule, Icon],
  templateUrl: './potluck-management.html',
  styleUrl: './potluck-management.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PotluckManagement {
  protected readonly store = inject(PotluckStore);
  protected readonly nameMaxLength = POTLUCK_NAME_MAX_LENGTH;
  protected readonly dishMaxLength = POTLUCK_DISH_MAX_LENGTH;
  protected readonly filter = signal<'active' | 'removed'>('active');
  protected readonly search = signal('');
  protected readonly editing = signal<string | null>(null);
  protected readonly name = signal('');
  protected readonly dish = signal('');
  protected readonly busy = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly visible = computed(() => {
    const search = this.search().trim().toLocaleLowerCase('fr');
    return this.store
      .entries()
      .filter(
        (entry) =>
          entry.active === (this.filter() === 'active') &&
          `${entry.name} ${entry.dish}`.toLocaleLowerCase('fr').includes(search),
      );
  });

  protected edit(entry: PotluckEntry): void {
    this.editing.set(entry.id);
    this.name.set(entry.name);
    this.dish.set(entry.dish);
    this.message.set('');
    this.error.set('');
  }

  protected async save(entry: PotluckEntry): Promise<void> {
    await this.perform(entry, async () => {
      await this.store.edit(entry, this.name(), this.dish());
      this.editing.set(null);
      this.message.set('Repas modifié.');
    });
  }

  protected async toggle(entry: PotluckEntry): Promise<void> {
    await this.perform(entry, async () => {
      await this.store.setActive(entry, !entry.active);
      if (this.editing() === entry.id) this.editing.set(null);
      this.message.set(
        entry.active ? 'Repas retiré du potluck.' : 'Repas rétabli dans le potluck.',
      );
    });
  }

  private async perform(entry: PotluckEntry, action: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(entry.id);
    this.error.set('');
    this.message.set('');
    try {
      await action();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'La modification a échoué.');
    } finally {
      this.busy.set(null);
    }
  }
}
