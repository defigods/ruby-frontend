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
    1: {
      address: '0x568538C3c6A8bB6aDc2Bf2bd7620EaA54D37a720',
      blockNumber: 11734016,
    },
    42: {
      address: '0x435fc1B52A3682b6F39a9c408e99BA6573816528',
      blockNumber: 24806623,
    },
  };
