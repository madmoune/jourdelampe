import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PARTICIPANT_NAME_MAX_LENGTH } from './participant';
import { ParticipantStore } from './participant-store';

/** Le contenu du ng-template n'est créé qu'après l'enregistrement d'un nom. */
@Component({
  selector: 'app-riddle-access',
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './riddle-access.html',
  styleUrl: './riddle-access.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleAccess {
  protected readonly store = inject(ParticipantStore);
  readonly participantName = computed(() =>
    this.store.canSolve() ? (this.store.participant()?.name ?? null) : null,
  );
  protected readonly content = contentChild.required(TemplateRef<unknown>);
  protected readonly nameMaxLength = PARTICIPANT_NAME_MAX_LENGTH;
  protected readonly name = signal('');
  protected readonly editing = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly profileSummary = viewChild<ElementRef<HTMLElement>>('profileSummary');
  private focusName = false;
  private focusSummary = false;

  constructor() {
    afterRenderEffect(() => {
      const input = this.nameInput()?.nativeElement;
      const summary = this.profileSummary()?.nativeElement;
      if (this.focusName && input) {
        input.focus();
        this.focusName = false;
      }
      if (this.focusSummary && summary) {
        summary.focus({ preventScroll: true });
        this.focusSummary = false;
      }
    });
  }

  protected edit(): void {
    this.name.set(this.store.participant()?.name ?? '');
    this.error.set('');
    this.message.set('');
    this.editing.set(true);
    this.focusName = true;
  }

  protected cancel(): void {
    this.editing.set(false);
    this.error.set('');
    this.focusSummary = true;
  }

  protected async submit(): Promise<void> {
    if (this.store.saving()) return;
    this.error.set('');
    this.message.set('');
    try {
      await this.store.saveName(this.name());
      this.editing.set(false);
      this.message.set('Ton nom est enregistré.');
      this.focusSummary = true;
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'L’enregistrement a échoué.');
    }
  }
}
