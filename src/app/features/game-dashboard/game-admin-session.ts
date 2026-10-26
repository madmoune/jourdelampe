import { inject, Injectable, signal } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../../core/config/firebase.config';

// Identifiant technique du compte de gestion; seul le mot de passe est demandé à l’écran.
export const GAME_ADMIN_EMAIL = 'gestion-enigmes@jourdelampe.firebaseapp.com';

@Injectable()
export class GameAdminSession {
  private readonly config = inject(FIREBASE_CONFIG);
  private app?: Promise<FirebaseApp>;
  private auth?: Promise<Auth>;
  private readonly authorizedState = signal(false);
  readonly authorized = this.authorizedState.asReadonly();

  getApp(): Promise<FirebaseApp> {
    if (!this.config) return Promise.reject(new Error('Firebase est indisponible.'));
    if (!this.app) {
      const config = this.config;
      this.app = import('firebase/app').then(
        ({ getApps, initializeApp }) =>
          getApps().find((app) => app.name === 'jour-de-lampe-admin') ??
          initializeApp(config, 'jour-de-lampe-admin'),
      );
    }
    return this.app;
  }

  async login(password: string): Promise<void> {
    this.authorizedState.set(false);
    try {
      const auth = await this.getAuth();
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const credential = await signInWithEmailAndPassword(auth, GAME_ADMIN_EMAIL, password);
      if ((await credential.user.getIdTokenResult()).claims['gameAdmin'] !== true) {
        await this.logout();
        throw new Error('Accès refusé.');
      }
      this.authorizedState.set(true);
    } catch {
      throw new Error('Mot de passe incorrect ou accès indisponible. Réessaie dans un instant.');
    }
  }

  async token(): Promise<string> {
    const auth = await this.getAuth();
    if (!this.authorized() || !auth.currentUser)
      throw new Error('Connecte-toi au tableau de bord.');
    return auth.currentUser.getIdToken();
  }

  async logout(): Promise<void> {
    this.authorizedState.set(false);
    if (this.auth) {
      const { signOut } = await import('firebase/auth');
      await signOut(await this.auth);
    }
  }

  private getAuth(): Promise<Auth> {
    this.auth ??= Promise.all([this.getApp(), import('firebase/auth')]).then(
      ([app, { initializeAuth, inMemoryPersistence }]) =>
        initializeAuth(app, { persistence: inMemoryPersistence }),
    );
    return this.auth;
  }
}
