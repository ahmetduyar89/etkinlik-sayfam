import test from 'node:test';
import assert from 'node:assert/strict';
import { canPossiblyMate } from '../apps/satranc/src/services/MatingMaterial.js';

const pos = (...items) => Object.fromEntries(items.map(([sq, c, t]) => [sq, { color: c, type: t }]));
const K = [['e1', 'w', 'k'], ['e8', 'b', 'k']];

test('çıplak şah ve tek hafif taş mat edemez', () => {
  assert.equal(canPossiblyMate(pos(...K), 'w'), false);
  assert.equal(canPossiblyMate(pos(...K, ['c1', 'w', 'b']), 'w'), false);
  assert.equal(canPossiblyMate(pos(...K, ['b1', 'w', 'n']), 'w'), false);
});
test('piyon, kale, vezir mat edebilir', () => {
  for (const t of ['p', 'r', 'q']) assert.equal(canPossiblyMate(pos(...K, ['a2', 'w', t]), 'w'), true);
});
test('iki at, at+fil, zıt renkli filler mat edebilir', () => {
  assert.equal(canPossiblyMate(pos(...K, ['b1', 'w', 'n'], ['g1', 'w', 'n']), 'w'), true);
  assert.equal(canPossiblyMate(pos(...K, ['b1', 'w', 'n'], ['c1', 'w', 'b']), 'w'), true);
  assert.equal(canPossiblyMate(pos(...K, ['c1', 'w', 'b'], ['f1', 'w', 'b']), 'w'), true); // c1 koyu, f1 açık... zıt
});
test('aynı renkli iki fil, rakip çıplaksa mat edemez', () => {
  assert.equal(canPossiblyMate(pos(...K, ['c1', 'w', 'b'], ['e3', 'w', 'b']), 'w'), false);
});
test('karşı tarafın taşı siper olabilir', () => {
  assert.equal(canPossiblyMate(pos(...K, ['b1', 'w', 'n'], ['a7', 'b', 'p']), 'w'), true);
  assert.equal(canPossiblyMate(pos(...K, ['c1', 'w', 'b'], ['a7', 'b', 'n']), 'w'), true);
});
test('iki tarafta aynı renkli filler kaldıysa kimse mat edemez', () => {
  assert.equal(canPossiblyMate(pos(...K, ['c1', 'w', 'b'], ['f8', 'b', 'b']), 'w'), false); // ikisi de koyu
  assert.equal(canPossiblyMate(pos(...K, ['c1', 'w', 'b'], ['c8', 'b', 'b']), 'w'), true); // zıt renk
});
