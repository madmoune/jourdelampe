import { isChunkLoadError } from './chunk-load-recovery';

describe('récupération des chunks', () => {
  it('reconnaît l’import dynamique d’un ancien chunk supprimé', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://example.com/chunk-old.js',
        ),
      ),
    ).toBe(true);
  });

  it('reconnaît aussi les messages de chargement de chunk des navigateurs', () => {
    expect(isChunkLoadError(new Error('Loading chunk 42 failed.'))).toBe(true);
    expect(isChunkLoadError('ChunkLoadError: Loading CSS chunk failed')).toBe(true);
  });

  it('ne recharge pas pour une erreur applicative ordinaire', () => {
    expect(isChunkLoadError(new Error('Le jeu n’a pas pu enregistrer la réponse.'))).toBe(false);
  });
});
