import { roundToDecimals } from '../src/util';

test('roundToDecimals', () => {
  expect(roundToDecimals(0, 0)).toBe(0);
  expect(roundToDecimals(2, 0)).toBe(2);
  expect(roundToDecimals(1.555, 2)).toBe(1.56);
  expect(roundToDecimals(1.5550, 2)).toBe(1.56);
  expect(roundToDecimals(1.5551, 2)).toBe(1.56);
  expect(roundToDecimals(1.3555, 3)).toBe(1.356);
});
