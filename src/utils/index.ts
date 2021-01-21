import { formatEther, getAddress } from 'ethers/lib/utils';
import { QuoteToken, TimeHistory, TimeHistoryEntry, Token } from '../types';
import { BigNumber } from '@ethersproject/bignumber';

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
};

export function getEtherscanLink(
  chainId: number,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
  }etherscan.io`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

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
export function getTokenPercentChange(
  token: Token,
  atTimestamp?: number,
  timeHistory: TimeHistory = TimeHistory.ONE_DAY,
): [number, number] {
  return getPercentChange(
    token.prices[timeHistory],
    token.currentPrice,
    atTimestamp,
  );
}

export function getPercentChange(
  entry: TimeHistoryEntry | undefined,
  currentPrice: number,
  atTimestamp?: number,
): [number, number] {
  if (!entry) {
    return [0, 0];
  }

  const base = atTimestamp ? entry[atTimestamp] : getSortedPrices(entry)[0];

  const difference = currentPrice - base;

  if (currentPrice === 0) {
    return [difference, difference === 0 ? 0 : -1];
  }

  return [difference, difference / currentPrice];
}

export function getTokenAddress(token: Token | QuoteToken, chainId: number) {
  return token?.addresses.find((t) => t.chainId === chainId)?.value;
}

export function formatBN(bigNumber: BigNumber, decimals = 4): string {
  const temp = formatEther(bigNumber);

  const result = Number(temp).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
  const test = '0.' + '0'.repeat(decimals);

  if (test === result) {
    return '<' + result;
  } else {
    return result;
  }
}

export function sortBigNumbers(
  a: BigNumber,
  b: BigNumber,
  ascending = true,
): number {
  if (a.sub(b).gt(0)) {
    return ascending ? 1 : -1;
  } else {
    return ascending ? -1 : 1;
  }
}

export * from './debounce';
export * from './web3';
export * from './hooks';
