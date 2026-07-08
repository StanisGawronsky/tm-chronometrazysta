import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAgendaCsv } from '../src/csv-import.js';

describe('csv-import', () => {
  it('parses full agenda csv', () => {
    const csv = `imie,typ,agenda1,agenda2,agenda3
Ania,mowa,5:00,6:00,7:00
Jan,gp,,,
Piotr,ewaluacja,,,`;

    const { rows, errors } = parseAgendaCsv(csv);
    assert.equal(errors.length, 0);
    assert.equal(rows.length, 3);
    assert.equal(rows[0].name, 'Ania');
    assert.equal(rows[0].presetId, 'custom');
    assert.equal(rows[0].customTimes?.t3, 420);
    assert.equal(rows[1].presetId, 'gp');
    assert.equal(rows[2].presetId, 'evaluation');
  });

  it('parses single agenda time', () => {
    const csv = `imie,typ,agenda1,agenda2,agenda3
Maria,mowa,,,6:00`;
    const { rows, errors } = parseAgendaCsv(csv);
    assert.equal(errors.length, 0);
    assert.equal(rows[0].customTimes?.t3, 360);
    assert.equal(rows[0].customTimes?.t1, null);
  });

  it('reports unknown type', () => {
    const csv = `imie,typ,agenda1,agenda2,agenda3
Xyz,unknown,,,`;
    const { rows, errors } = parseAgendaCsv(csv);
    assert.equal(rows.length, 0);
    assert.ok(errors.some((e) => e.includes('nieznany typ')));
  });
});
