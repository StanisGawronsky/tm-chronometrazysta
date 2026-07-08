import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCustomPreset,
  evaluateResult,
  formatTimeMs,
  getFlagForElapsed,
  getPreset,
  isInGrace,
  parseTimeInput,
  validateCustomTimes,
} from '../src/presets.js';

describe('presets', () => {
  it('formatTimeMs', () => {
    assert.equal(formatTimeMs(372000), '6:12');
    assert.equal(formatTimeMs(45000), '0:45');
  });

  it('speech 5-6-7 flags', () => {
    const p = getPreset('speech_5_6_7');
    assert.equal(getFlagForElapsed(p, 299000), 'neutral');
    assert.equal(getFlagForElapsed(p, 300000), 'green');
    assert.equal(getFlagForElapsed(p, 360000), 'yellow');
    assert.equal(getFlagForElapsed(p, 420000), 'red');
    assert.ok(isInGrace(p, 425000));
    assert.ok(!isInGrace(p, 451000));
  });

  it('speech 5-6-7 evaluation in range', () => {
    const p = getPreset('speech_5_6_7');
    assert.equal(evaluateResult(p, 360000).status, 'w ramach');
    assert.equal(evaluateResult(p, 200000).status, 'poniżej minimum');
    assert.equal(evaluateResult(p, 500000).status, 'powyżej maksimum');
  });

  it('GP qualification', () => {
    const p = getPreset('gp');
    assert.equal(evaluateResult(p, 75000).qualified, true);
    assert.equal(evaluateResult(p, 45000).qualified, false);
    assert.equal(evaluateResult(p, 160000).qualified, false);
  });

  it('evaluation only red at 1 min', () => {
    const p = getPreset('evaluation');
    assert.equal(getFlagForElapsed(p, 30000), 'neutral');
    assert.equal(getFlagForElapsed(p, 60000), 'red');
  });

  it('parseTimeInput', () => {
    assert.equal(parseTimeInput('5:30'), 330);
    assert.equal(parseTimeInput('5'), 300);
    assert.equal(parseTimeInput(''), null);
    assert.equal(parseTimeInput('bad'), null);
  });

  it('validateCustomTimes', () => {
    assert.equal(validateCustomTimes({ t1: 300, t2: 360, t3: 420 }), null);
    assert.equal(validateCustomTimes({ t1: null, t2: null, t3: 420 }), null);
    assert.ok(validateCustomTimes({ t1: 400, t2: 360, t3: 420 }));
  });

  it('custom preset flags 5-6-7', () => {
    const p = buildCustomPreset({ t1: 300, t2: 360, t3: 420 });
    assert.equal(getFlagForElapsed(p, 300000), 'green');
    assert.equal(getFlagForElapsed(p, 360000), 'yellow');
    assert.equal(getFlagForElapsed(p, 420000), 'red');
  });

  it('custom single agenda time (only red)', () => {
    const p = buildCustomPreset({ t1: null, t2: null, t3: 420 });
    assert.equal(getFlagForElapsed(p, 10000), 'neutral');
    assert.equal(getFlagForElapsed(p, 420000), 'red');
    assert.equal(evaluateResult(p, 430000).status, 'w ramach');
    assert.equal(evaluateResult(p, 500000).status, 'powyżej maksimum');
  });
});
