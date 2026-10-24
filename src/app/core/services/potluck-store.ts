import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { PotluckEntry } from '../models/potluck-entry';
import { parsePotluck, potluckKey, validatePotluck } from '../utils/potluck';
import { RealtimeDatabase } from './realtime-database';

@Injectable({ providedIn: 'root' })
export class PotluckStore {
  private readonly database = inject(RealtimeDatabase);
  private readonly entriesState = signal<readonly PotluckEntry[]>([]);
  private readonly readyState = signal(false);
  private readonly loadingState = signal(this.database.configured);
  private readonly errorState = signal('');
  readonly entries = this.entriesState.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly active = computed(() => this.entries().filter((entry) => entry.active));
  readonly removed = computed(() => this.entries().filter((entry) => !entry.active));

  constructor() {
    if (!this.database.configured) {
      this.unavailable();
      return;
    }
    this.database
      .watch<unknown>('potluck')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (value) => {
          try {
            this.entriesState.set(parsePotluck(value));
            this.readyState.set(true);
            this.loadingState.set(false);
            this.errorState.set('');
          } catch {
            this.unavailable();
          }
        },
        error: () => this.unavailable(),
      });
  }

  async add(name: string, dish: string): Promise<PotluckEntry> {
    const fields = validatePotluck(name, dish);
    this.assertUnique(fields.name, fields.dish);
    this.assertReady();
    const now = Date.now();
    const entry = { ...fields, active: true, createdAt: now, updatedAt: now };
    try {
      const id = await this.database.append('potluck', entry);
      return { ...entry, id };
    } catch {
      throw new Error('Le repas n’a pas pu être ajouté. Réessaie dans un instant.');
    }
  }

  async edit(entry: PotluckEntry, name: string, dish: string): Promise<void> {
    const fields = validatePotluck(name, dish);
    this.assertUnique(fields.name, fields.dish, entry.id);
    await this.change(entry, fields);
  }

  async setActive(entry: PotluckEntry, active: boolean): Promise<void> {
    if (active) this.assertUnique(entry.name, entry.dish, entry.id);
    await this.change(entry, { active });
  }

  private assertUnique(name: string, dish: string, exceptId?: string): void {
    const key = potluckKey(name, dish);
    if (
      this.active().some(
        (entry) => entry.id !== exceptId && potluckKey(entry.name, entry.dish) === key,
      )
    ) {
      throw new Error('Ce repas est déjà inscrit à ce nom.');
    }
  }

  private assertReady(): void {
    if (!this.ready())
      throw new Error('Le potluck n’est pas disponible pour le moment. Réessaie dans un instant.');
  }

  private async change(entry: PotluckEntry, patch: Record<string, unknown>): Promise<void> {
    this.assertReady();
    if (!/^[A-Za-z0-9_-]{1,80}$/u.test(entry.id)) throw new Error('Ce repas est introuvable.');
    try {
      await this.database.update(`potluck/${entry.id}`, { ...patch, updatedAt: Date.now() });
    } catch {
      throw new Error('La modification n’a pas pu être enregistrée. Réessaie dans un instant.');
    }
  }

  private unavailable(): void {
    this.readyState.set(false);
    this.loadingState.set(false);
    this.errorState.set(
      'Le potluck est temporairement indisponible. Réessaie en rechargeant la page.',
    );
  }
}
