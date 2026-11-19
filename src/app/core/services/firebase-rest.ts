import { inject, Injectable } from '@angular/core';
import { FIREBASE_CONFIG } from '../config/firebase.config';

export class DatabaseWriteError extends Error {
  constructor(readonly status: number) {
    super('Écriture Firebase refusée.');
  }
}

/** Les lectures temps réel ne voient que les écritures confirmées, jamais une réussite optimiste. */
@Injectable({ providedIn: 'root' })
export class FirebaseRest {
  private readonly config = inject(FIREBASE_CONFIG);

  async read(path: string, token: string): Promise<unknown> {
    const response = await fetch(this.url(path, token), { cache: 'no-store' });
    if (!response.ok) throw new Error('Lecture Firebase refusée.');
    return response.json();
  }

  async update(path: string, patch: Record<string, unknown>, token: string): Promise<void> {
    const response = await fetch(this.url(path, token), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new DatabaseWriteError(response.status);
  }

  private url(path: string, token: string): URL {
    if (!this.config?.databaseURL) throw new Error('La base de données n’est pas configurée.');
    const url = new URL(`${this.config.databaseURL.replace(/\/$/u, '')}/${path}.json`);
    url.searchParams.set('auth', token);
    return url;
  }
}
