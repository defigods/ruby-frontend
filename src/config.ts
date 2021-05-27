import { Network } from './types';

export const websocket = {
  url:
    process.env.NODE_ENV === 'production'
      ? 'https://data.rubicon.finance'
      : 'localhost:3000',
};

export const DEFAULT_CHAIN = 1;

export const LIQUIDITY_PROVIDER_FEE = 0.002;

export const FAUCET_ENABLED_IDS = [42];

export const markets: Record<number, { address: string; blockNumber: number }> =
  {
    [Network.MAINNET]: {
      address: '0x568538C3c6A8bB6aDc2Bf2bd7620EaA54D37a720',
      blockNumber: 11734016,
    },
    [Network.KOVAN]: {
      address: '0x435fc1B52A3682b6F39a9c408e99BA6573816528',
      blockNumber: 20875039,
    },
    [Network.OPTIMISM_KOVAN]: {
      address: '0x619beC3E00849e48112B162fDa1A6b1f8BC9d18F',
      blockNumber: 1, // TODO: Check!
    },
  };
