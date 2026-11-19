import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { FirebaseRest } from '../../core/services/firebase-rest';

@Component({
  selector: 'app-riddle-spoiler',
  template: `
    <button type="button" [attr.aria-expanded]="state().open" (click)="toggle()">
      {{ state().open ? 'Masquer la réponse' : 'Révéler la réponse' }}
    </button>
    @if (state().open) {
      <p aria-live="polite">{{ state().text }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      margin-top: 14px;
    }
    button {
      min-height: 40px;
      padding: 7px 12px;
      border: 1px solid #9a83ac;
      background: #2c2039;
      color: #ece4f3;
      text-align: left;
    }
    p {
      margin: 8px 0 0;
      color: #e9f5bf;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleSpoiler {
  readonly riddleId = input.required<string>();
  readonly context = input.required<string>();
  private readonly session = inject(AnonymousSession);
  private readonly database = inject(FirebaseRest);
  protected readonly state = linkedSignal({
    source: () => [this.riddleId(), this.context()],
    computation: () => ({ open: false, text: '' }),
  });

  protected async toggle(): Promise<void> {
    if (this.state().open) {
      this.state.set({ open: false, text: '' });
      return;
    }
    const pending = { open: true, text: 'Chargement de la réponse…' };
    const path = `riddleSecrets/${this.riddleId()}/answer`;
    this.state.set(pending);
    let text: string;
    try {
      const answer = await this.database.read(path, await this.session.token());
      text = typeof answer === 'string' && answer.trim() ? answer : 'Réponse indisponible.';
    } catch {
      text = 'La réponse n’a pas pu être chargée. Masque-la et réessaie.';
    }
    if (this.state() === pending) this.state.set({ open: true, text });
  }
}
