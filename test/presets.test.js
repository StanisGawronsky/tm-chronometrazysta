import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateResult,
  formatTimeMs,
  getFlagForElapsed,
  getPreset,
  isInGrace,
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
});
