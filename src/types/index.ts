export enum TimeHistory {
  ONE_DAY = '1 day|1d',
  ONE_WEEK = '1 week|1w',
  ONE_MONTH = '1 month|1m',
  THREE_MONTHS = '3 months|3m',
  SIX_MONTHS = '6 months|6m',
  ALL_TIME = 'all|all',
}

export type TokenPrice = {
  [key in TimeHistory]?: {
    [timestamp: number]: number;
  };
};

export interface TokenTrade {
  quantity: number;
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
}

export interface UserToken extends Token {
  quantity: number;
  // purchases: [timestamp, number][]
  // etc
}
