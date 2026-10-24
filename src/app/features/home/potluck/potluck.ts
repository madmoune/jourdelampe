import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PotluckStore } from '../../../core/services/potluck-store';
import { POTLUCK_DISH_MAX_LENGTH, POTLUCK_NAME_MAX_LENGTH } from '../../../core/utils/potluck';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-potluck',
  imports: [FormsModule, Icon],
  templateUrl: './potluck.html',
  styleUrl: './potluck.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Potluck {
  protected readonly store = inject(PotluckStore);
  protected readonly nameMaxLength = POTLUCK_NAME_MAX_LENGTH;
  protected readonly dishMaxLength = POTLUCK_DISH_MAX_LENGTH;
  protected readonly name = signal('');
  protected readonly dish = signal('');
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    this.message.set('');
    this.error.set('');
    this.busy.set(true);
    try {
      await this.store.add(this.name(), this.dish());
      this.dish.set('');
      this.message.set('Ton repas a été ajouté au potluck.');
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'L’ajout a échoué. Réessaie.');
    } finally {
      this.busy.set(false);
    }
  }
}
