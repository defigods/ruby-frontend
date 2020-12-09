export const websocket = {
  url:
    process.env.NODE_ENV === 'production'
      ? 'http://data.rubicon.finance:3000'
      : 'localhost:3000',
};

export const DEFAULT_CHAIN = 42;

export const markets: Record<
  number,
  { address: string; blockNumber: number }
> = {
  // 1: {
  //   address: 'TODO',
  //   blockNumber: 0,
  // },
  [42]: {
    address: '0x9C735089059689803F507DAAad78c6970468124d',
    blockNumber: 20875039,
  },
};
