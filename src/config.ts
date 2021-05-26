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
      address: '0x9C735089059689803F507DAAad78c6970468124d',
      blockNumber: 20875039,
    },
    [Network.OPTIMISM_KOVAN]: {
      address: '0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0',
      blockNumber: 1, // TODO: Check!
    },
  };
