export enum TimeHistory {
  ONE_DAY = '1 day|1d',
  ONE_WEEK = '1 week|1w',
  ONE_MONTH = '1 month|1m',
  THREE_MONTHS = '3 months|3m',
  ALL_TIME = 'all|all',
}

export type TokenPrice = {
  [key in TimeHistory]?: {
    [timestamp: number]: number;
  };
};

export interface TokenTrade {
  baseAmount: number;
  price: number;
}

export interface Token {
  ticker: string;
  name: string;
  logo?: string;
  currentPrice: number;
  prices: TokenPrice;
  description?: string;
  asks: TokenTrade[];
  bids: TokenTrade[];
  addresses: { chainId: number; value: string }[];
}

export interface UserToken extends Token {
  quantity: number;
  // purchases: [timestamp, number][]
  // etc
}
