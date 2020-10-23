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
    address: '0x1b64D1839362A4B5ABF0DccAb8c06F362d76152D',
    blockNumber: 20875039,
  },
};
