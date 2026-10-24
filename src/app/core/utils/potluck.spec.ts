import { parsePotluck, potluckKey, validatePotluck } from './potluck';

describe('données du potluck', () => {
  it('normalise les champs et conserve les accents', () => {
    expect(validatePotluck('  Chloé\n Roy ', ' Lasagne  aux\n légumes ')).toEqual({
      name: 'Chloé Roy',
      dish: 'Lasagne aux légumes',
    });
    expect(potluckKey(' Chloé ', 'Lasagne')).toBe(potluckKey('CHLOÉ', ' lasagne '));
  });

  it('refuse les champs vides et les textes trop longs', () => {
    expect(() => validatePotluck(' ', 'Lasagne')).toThrow('ton nom');
    expect(() => validatePotluck('Sam', ' ')).toThrow('le repas');
    expect(() => validatePotluck('a'.repeat(61), 'Lasagne')).toThrow('60 caractères');
    expect(() => validatePotluck('Sam', 'a'.repeat(161))).toThrow('160 caractères');
  });

  it('accepte une liste vide et garde les repas retirés pour la maintenance', () => {
    expect(parsePotluck(null)).toEqual([]);
    expect(parsePotluck({})).toEqual([]);
    const entries = parsePotluck({
      second: { name: 'Alex', dish: 'Tarte', active: false, createdAt: 2, updatedAt: 3 },
      first: { name: 'Sam', dish: 'Lasagne', active: true, createdAt: 1, updatedAt: 1 },
    });
    expect(entries.map((entry) => entry.id)).toEqual(['first', 'second']);
    expect(entries[1].active).toBe(false);
  });

  it('ignore les enregistrements mal formés et refuse une racine invalide', () => {
    const valid = { name: 'Sam', dish: 'Lasagne', active: true, createdAt: 1, updatedAt: 1 };
    expect(
      parsePotluck({
        valid,
        badName: { ...valid, name: 6 },
        badDate: { ...valid, updatedAt: Infinity },
        missing: { name: 'Sam' },
        'bad/path': valid,
      }),
    ).toHaveLength(1);
    expect(() => parsePotluck('invalide')).toThrow('invalide');
  });
});
