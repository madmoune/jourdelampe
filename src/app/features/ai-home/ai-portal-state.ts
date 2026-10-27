import { Injectable, signal } from '@angular/core';

/** Conserve le portail pendant les déplacements internes; un rechargement remet l’accueil. */
@Injectable({ providedIn: 'root' })
export class AiPortalState {
  readonly revealed = signal(false);
}
