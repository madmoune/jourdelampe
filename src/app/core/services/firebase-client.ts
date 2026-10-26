import { inject, Injectable } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import { FIREBASE_CONFIG } from '../config/firebase.config';

/** Une même application pour la base de données et les profils sans inscription. */
@Injectable({ providedIn: 'root' })
export class FirebaseClient {
  private readonly config = inject(FIREBASE_CONFIG);
  private app?: Promise<FirebaseApp>;
  readonly configured = this.config !== null;

  getApp(): Promise<FirebaseApp> {
    if (!this.config) {
      return Promise.reject(new Error('Firebase doit être configuré dans environment.ts.'));
    }
    if (!this.app) {
      const config = this.config;
      this.app = import('firebase/app')
        .then(
          ({ getApps, initializeApp }) =>
            getApps().find((candidate) => candidate.name === 'jour-de-lampe') ??
            initializeApp(config, 'jour-de-lampe'),
        )
        .catch((error: unknown) => {
          this.app = undefined;
          throw error;
        });
    }
    return this.app;
  }
}
