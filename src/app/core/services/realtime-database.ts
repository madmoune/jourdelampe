import { inject, Injectable } from '@angular/core';
import { defer, Observable, switchMap } from 'rxjs';
import type { Database } from 'firebase/database';
import { FIREBASE_CONFIG } from '../config/firebase.config';

/** Adaptateur facultatif. Le SDK est chargé à la première utilisation seulement. */
@Injectable({ providedIn: 'root' })
export class RealtimeDatabase {
  private readonly config = inject(FIREBASE_CONFIG);
  private database?: Promise<Database>;
  readonly configured = this.config !== null;

  watch<T>(path: string): Observable<T | null> {
    return defer(async () => {
      const database = await this.getDatabase();
      const { onValue, ref } = await import('firebase/database');
      return { database, onValue, ref };
    }).pipe(
      switchMap(
        ({ database, onValue, ref }) =>
          new Observable<T | null>((subscriber) =>
            onValue(
              ref(database, path),
              (snapshot) => subscriber.next(snapshot.exists() ? (snapshot.val() as T) : null),
              (error) => subscriber.error(error),
            ),
          ),
      ),
    );
  }

  async initialize<T>(path: string, initial: T): Promise<void> {
    const database = await this.getDatabase();
    const { ref, runTransaction } = await import('firebase/database');
    await runTransaction(
      ref(database, path),
      (current) => (current === null ? initial : undefined),
      {
        applyLocally: false,
      },
    );
  }

  async append(path: string, value: unknown): Promise<string> {
    const database = await this.getDatabase();
    const { push, ref, set } = await import('firebase/database');
    const entry = push(ref(database, path));
    await set(entry, value);
    return entry.key!;
  }

  async update(path: string, value: Record<string, unknown>): Promise<void> {
    const database = await this.getDatabase();
    const { ref, update } = await import('firebase/database');
    await update(ref(database, path), value);
  }

  private getDatabase(): Promise<Database> {
    if (!this.config) {
      return Promise.reject(new Error('Firebase doit être configuré dans environment.ts.'));
    }

    if (!this.database) {
      const config = this.config;
      this.database = Promise.all([import('firebase/app'), import('firebase/database')])
        .then(([{ getApps, initializeApp }, { getDatabase }]) => {
          const app =
            getApps().find((candidate) => candidate.name === 'jour-de-lampe') ??
            initializeApp(config, 'jour-de-lampe');
          return getDatabase(app);
        })
        .catch((error: unknown) => {
          this.database = undefined;
          throw error;
        });
    }

    return this.database;
  }
}
