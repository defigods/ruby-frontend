export const websocket = {
  url:
    process.env.NODE_ENV === 'production'
      ? 'http://data.rubicon.finance:3000'
      : 'localhost:3000',
};

export const DEFAULT_CHAIN = 42;

export const LIQUIDITY_PROVIDER_FEE = 0.002;

export const FAUCET_ENABLED_IDS = [42];

export const markets: Record<
  number,
  { address: string; blockNumber: number }
> = {
  1: {
    address: '0x568538C3c6A8bB6aDc2Bf2bd7620EaA54D37a720',
    blockNumber: 20875039,
  },
  42: {
    address: '0x9C735089059689803F507DAAad78c6970468124d',
    blockNumber: 20875039,
  },
};
