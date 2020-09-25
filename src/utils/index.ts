import { getAddress } from 'ethers/lib/utils';
import { TimeHistory, Token } from '../types';

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function getSortedPrices(prices: { [timestamp: number]: number }) {
  return Object.keys(prices)
    .map((n) => Number(n))
    .sort()
    .map((t) => prices[t]);
}

/**
 * Calculate the percent change of a Token given a start time
 * @return [absolute difference, percent change]
 */
export function getPercentChange(
  token: Token,
  timeHistory: TimeHistory = TimeHistory.ONE_DAY,
): [number, number] {
  const sorted = getSortedPrices(token.prices[timeHistory] || {});
  if (sorted.length === 0) return [0, 0];

  const difference = sorted[sorted.length - 1] - sorted[0];

  return [difference, difference / sorted[0]];
}

export * from './debounce';
export * from './library';
