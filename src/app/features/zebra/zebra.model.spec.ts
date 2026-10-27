import {
  cellKey,
  cellState,
  encodeCompleteGrid,
  parseMarks,
  toggleCell,
  ZEBRA_BLOCKS,
  ZebraMarks,
} from './zebra.model';

describe('déductions de la grille Zebra à huit positions', () => {
  const block = ZEBRA_BLOCKS[0];
  it('bloque seulement les autres cases de la ligne et colonne du même bloc', () => {
    const marks = toggleCell({}, block, 0, 7, 'yes');
    expect(cellState(marks, block, 0, 7)).toBe('yes');
    expect(cellState(marks, block, 0, 0)).toBe('blocked');
    expect(cellState(marks, block, 3, 7)).toBe('blocked');
    expect(cellState(marks, block, 1, 0)).toBe('empty');
    expect(cellState(marks, ZEBRA_BLOCKS[1], 0, 7)).toBe('empty');
    expect(toggleCell(marks, block, 0, 0, 'yes')).toBe(marks);
  });
  it('annule une association et préserve les exclusions manuelles ainsi que les autres blocages', () => {
    let marks = toggleCell({}, block, 0, 0, 'no');
    marks = toggleCell(marks, block, 0, 7, 'yes');
    marks = toggleCell(marks, block, 1, 6, 'yes');
    marks = toggleCell(marks, block, 0, 7, 'yes');
    expect(cellState(marks, block, 0, 0)).toBe('no');
    expect(cellState(marks, block, 0, 6)).toBe('blocked');
    expect(cellState(marks, block, 3, 7)).toBe('empty');
  });
  it('demande les six blocs complets et permet quatre positions inutilisées par bloc', () => {
    let marks: ZebraMarks = {};
    for (const item of ZEBRA_BLOCKS)
      for (let row = 0; row < 4; row++) {
        expect(encodeCompleteGrid(marks)).toBeNull();
        marks = toggleCell(marks, item, row, item.column === 'position' ? row + 4 : row, 'yes');
      }
    expect(encodeCompleteGrid(marks)).toBe('567856781234567812341234');
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
