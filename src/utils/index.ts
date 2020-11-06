import { getAddress } from 'ethers/lib/utils';
import { QuoteToken, TimeHistory, Token } from '../types';

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function findTokenByAddress(
  address: string,
  tokens: Token[],
): Token | undefined {
  return tokens.find((token) =>
    token.addresses.find((a) => a.value === address),
  );
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
  atTimestamp?: number,
  timeHistory: TimeHistory = TimeHistory.ONE_DAY,
): [number, number] {
  if (!token.prices[timeHistory]) {
    return [0, 0];
  }

  const base = atTimestamp
    ? token.prices[timeHistory]![atTimestamp]
    : token.prices[timeHistory]![
        Number(Object.keys(token.prices[timeHistory]!)[0])
      ];

  const difference = token.currentPrice - base;

  return [difference, difference / token.currentPrice];
}

export function getTokenAddress(token: Token | QuoteToken, chainId: number) {
  return token?.addresses.find((t) => t.chainId === chainId)?.value;
}

export * from './debounce';
export * from './web3';
export * from './hooks';
