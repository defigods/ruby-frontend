export const websocket = {
  url: 'localhost:3000',
};

export const markets: Record<
  number,
  { address: string; blockNumber: number }
> = {
  // 1: {
  //   address: 'TODO',
  //   blockNumber: 0,
  // },
  [42]: {
    address: '0x450C5368A2f39cb89F1266AE0B8c425167c0095f',
    blockNumber: 20875039,
  },
};
