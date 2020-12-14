import { BigNumber } from '@ethersproject/bignumber';

export enum TimeHistory {
  ONE_DAY = '1 day|1d',
  ONE_WEEK = '1 week|1w',
  ONE_MONTH = '1 month|1m',
  THREE_MONTHS = '3 months|3m',
  ALL_TIME = 'all|all',
}

export type Pair<B, Q> = [B, Q];

export type TimeHistoryEntry = {
  [timestamp: number]: number;
};

export type TokenPrice = {
  [key in TimeHistory]?: TimeHistoryEntry;
};

export interface TokenTrade {
  baseAmount: number;
  price: number;
}

export interface QuoteToken {
  ticker: string;
  name: string;
  logo?: string;
  description?: string;
  addresses: { chainId: number; value: string }[];
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
}

export type PortfolioData = TokenPrice;

export type UserTrade = {
  id: string;
  isBuy: boolean;
  payGem: string;
  buyGem: string;
  payAmount: number;
  buyAmount: number;
  timestamp: number;
  transactionHash: string;
};

export type UserTrades = {
  [ticker: string]: {
    buys: UserTrade[];
    sells: UserTrade[];
    balance: number;
  };
};

export interface ContractOffer {
  payAmount: BigNumber;
  payGem: string;
  buyAmount: BigNumber;
  buyGem: string;
  baseAddress: string;
  baseAmount: BigNumber;
  quoteAddress: string;
  quoteAmount: BigNumber;
  id: number;
  price: number; // baseAmount / quoteAmount
}
