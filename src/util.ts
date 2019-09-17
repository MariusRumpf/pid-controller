/* eslint-disable import/prefer-default-export */

/**
 * Rounds the given value to the given precision
 * @param val value to get rounded
 * @param decimals decimals to round to
 */
export const roundToDecimals = (val: number, decimals: number): number => (
  Number(`${Math.round(Number(`${val}e${decimals}`))}e-${decimals}`)
);
