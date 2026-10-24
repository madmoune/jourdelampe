import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FIREBASE_CONFIG } from '../config/firebase.config';
import { RealtimeDatabase } from './realtime-database';

describe('Firebase facultatif', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_CONFIG, useValue: null }],
    }),
  );

  it('reste désactivé sans configuration', () => {
    expect(TestBed.inject(RealtimeDatabase).configured).toBe(false);
  });

  it('explique la configuration manquante sans ouvrir de connexion', async () => {
    await expect(firstValueFrom(TestBed.inject(RealtimeDatabase).watch('example'))).rejects.toThrow(
      'Firebase doit être configuré',
    );
  });
});
