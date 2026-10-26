import { inject, Injectable } from '@angular/core';
import type { Auth } from 'firebase/auth';
import { defer, Observable, switchMap } from 'rxjs';
import { FirebaseClient } from './firebase-client';

@Injectable({ providedIn: 'root' })
export class AnonymousSession {
  private readonly client = inject(FirebaseClient);
  private auth?: Promise<Auth>;

  watch(): Observable<string | null> {
    return defer(async () => {
      const auth = await this.getAuth();
      const { onAuthStateChanged } = await import('firebase/auth');
      return { auth, onAuthStateChanged };
    }).pipe(
      switchMap(
        ({ auth, onAuthStateChanged }) =>
          new Observable<string | null>((subscriber) =>
            onAuthStateChanged(
              auth,
              (user) => subscriber.next(user?.uid ?? null),
              (error) => subscriber.error(error),
            ),
          ),
      ),
    );
  }

  async signIn(): Promise<string> {
    const auth = await this.getAuth();
    await auth.authStateReady();
    const { signInAnonymously } = await import('firebase/auth');
    return (auth.currentUser ?? (await signInAnonymously(auth)).user).uid;
  }

  async token(): Promise<string> {
    const auth = await this.getAuth();
    await auth.authStateReady();
    if (!auth.currentUser) throw new Error('Enregistre ton nom avant de répondre.');
    return auth.currentUser.getIdToken();
  }

  private getAuth(): Promise<Auth> {
    if (!this.auth) {
      this.auth = Promise.all([this.client.getApp(), import('firebase/auth')])
        .then(
          ([
            app,
            {
              initializeAuth,
              indexedDBLocalPersistence,
              browserLocalPersistence,
              inMemoryPersistence,
            },
          ]) =>
            initializeAuth(app, {
              persistence: [
                indexedDBLocalPersistence,
                browserLocalPersistence,
                inMemoryPersistence,
              ],
            }),
        )
        .catch((error: unknown) => {
          this.auth = undefined;
          throw error;
        });
    }
    return this.auth;
  }
}
