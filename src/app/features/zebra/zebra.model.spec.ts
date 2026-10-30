import {
  cellKey,
  cellState,
  encodeCompleteGrid,
  parseMarks,
  toggleCell,
  ZEBRA_ASSOCIATION_COUNT,
  ZEBRA_BLOCKS,
  ZEBRA_CATEGORIES,
  ZebraMarks,
} from './zebra.model';

describe('déductions de la grille Zebra à huit positions', () => {
  const block = ZEBRA_BLOCKS[2];
  it('bloque seulement les autres cases de la ligne et colonne du même bloc', () => {
    const marks = toggleCell({}, block, 0, 3, 'yes');
    expect(cellState(marks, block, 0, 3)).toBe('yes');
    expect(cellState(marks, block, 0, 0)).toBe('blocked');
    expect(cellState(marks, block, 3, 3)).toBe('blocked');
    expect(cellState(marks, block, 1, 0)).toBe('empty');
    expect(cellState(marks, ZEBRA_BLOCKS[4], 0, 3)).toBe('empty');
    expect(toggleCell(marks, block, 0, 0, 'yes')).toBe(marks);
  });
  it('annule une association et préserve les exclusions manuelles ainsi que les autres blocages', () => {
    let marks = toggleCell({}, block, 0, 0, 'no');
    marks = toggleCell(marks, block, 0, 3, 'yes');
    marks = toggleCell(marks, block, 1, 2, 'yes');
    marks = toggleCell(marks, block, 0, 3, 'yes');
    expect(cellState(marks, block, 0, 0)).toBe('no');
    expect(cellState(marks, block, 0, 2)).toBe('blocked');
    expect(cellState(marks, block, 3, 3)).toBe('empty');
  });
  it('bloque une colonne dès la première position et une ligne seulement après la deuxième', () => {
    for (const item of ZEBRA_BLOCKS.filter((item) => item.column === 'position')) {
      let marks = toggleCell({}, item, 0, 2, 'no');
      marks = toggleCell(marks, item, 0, 0, 'yes');
      expect(cellState(marks, item, 0, 1)).toBe('empty');
      expect(cellState(marks, item, 0, 2)).toBe('no');
      expect(cellState(marks, item, 1, 0)).toBe('blocked');
      expect(toggleCell(marks, item, 1, 0, 'yes')).toBe(marks);
      marks = toggleCell(marks, item, 0, 1, 'yes');
      expect(cellState(marks, item, 0, 0)).toBe('yes');
      expect(cellState(marks, item, 0, 1)).toBe('yes');
      expect(cellState(marks, item, 0, 2)).toBe('blocked');
      expect(cellState(marks, item, 0, 3)).toBe('blocked');
      expect(cellState(marks, item, 1, 1)).toBe('blocked');
      expect(cellState(marks, item, 1, 2)).toBe('empty');
      expect(toggleCell(marks, item, 0, 3, 'yes')).toBe(marks);
      expect(parseMarks(marks)).toEqual(marks);

      marks = toggleCell(marks, item, 0, 1, 'no');
      expect(cellState(marks, item, 0, 1)).toBe('no');
      expect(cellState(marks, item, 0, 2)).toBe('no');
      expect(cellState(marks, item, 0, 3)).toBe('empty');
      expect(cellState(marks, item, 1, 1)).toBe('empty');
      expect(cellState(marks, item, 1, 0)).toBe('blocked');
    }
  });
  it('restaure au plus deux positions par ligne, sans partager de colonne', () => {
    const item = ZEBRA_BLOCKS[0];
    const marks = parseMarks({
      [cellKey(item.id, 0, 0)]: 'yes',
      [cellKey(item.id, 0, 1)]: 'yes',
      [cellKey(item.id, 0, 2)]: 'yes',
      [cellKey(item.id, 0, 3)]: 'no',
      [cellKey(item.id, 1, 0)]: 'yes',
      [cellKey(item.id, 1, 2)]: 'yes',
    });
    expect(marks).toEqual({
      [cellKey(item.id, 0, 0)]: 'yes',
      [cellKey(item.id, 0, 1)]: 'yes',
      [cellKey(item.id, 0, 3)]: 'no',
      [cellKey(item.id, 1, 2)]: 'yes',
    });
  });
  it('demande deux positions par ligne, sans position partagée, dans chacun des trois blocs Position', () => {
    let marks: ZebraMarks = {};
    for (const item of ZEBRA_BLOCKS)
      for (let row = 0; row < 4; row++) {
        expect(encodeCompleteGrid(marks)).toBeNull();
        if (item.column === 'position') {
          marks = toggleCell(marks, item, row, row * 2, 'yes');
          expect(encodeCompleteGrid(marks)).toBeNull();
          marks = toggleCell(marks, item, row, row * 2 + 1, 'yes');
        } else marks = toggleCell(marks, item, row, row, 'yes');
      }
    expect(ZEBRA_ASSOCIATION_COUNT).toBe(36);
    expect(encodeCompleteGrid(marks)).toBe('123456781234567812341234567812341234');
    for (const item of ZEBRA_BLOCKS.filter((item) => item.column === 'position')) {
      expect(encodeCompleteGrid({ ...marks, [cellKey(item.id, 0, 1)]: 'no' })).toBeNull();
      expect(encodeCompleteGrid({ ...marks, [cellKey(item.id, 0, 2)]: 'yes' })).toBeNull();
      expect(
        encodeCompleteGrid({
          ...marks,
          [cellKey(item.id, 0, 1)]: 'no',
          [cellKey(item.id, 0, 2)]: 'yes',
        }),
      ).toBeNull();
    }
  });
  it('conserve l’ordre voulu des colonnes de positions', () => {
    expect(ZEBRA_CATEGORIES.position.values).toEqual(['1', '4', '5', '11', '18', '6', '3', '2']);
  });
  it('refuse une grille enregistrée avec des associations contradictoires', () => {
    const raw = {
      [cellKey(block.id, 0, 0)]: 'yes',
      [cellKey(block.id, 0, 1)]: 'yes',
      unknown: 'yes',
    };
    expect(Object.keys(parseMarks(raw))).toHaveLength(1);
    expect(parseMarks(null)).toEqual({});
    expect(parseMarks('invalide')).toEqual({});
  });
});
