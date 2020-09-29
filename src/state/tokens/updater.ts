import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { TimeHistory, Token, TokenPrice, TokenTrade } from '../../types';
import { fetchTokenList } from './actions';

function generateNextPrice(price: number, volatility: number): number {
  const rnd = Math.random(); // generate number, 0 <= x < 1.0
  let change_percent = 2 * volatility * rnd;
  if (change_percent > volatility) change_percent -= 2 * volatility;
  const change_amount = price * change_percent;
  return price + change_amount;
}

function getDateStart(timeDelimeter: TimeHistory): [number, number] {
  const NUM_PER = 50;
  let start: number;
  if (timeDelimeter === TimeHistory.ONE_DAY) {
    start = Date.now() - 24 * 60 * 60 * 1000;
  } else if (timeDelimeter === TimeHistory.ONE_WEEK) {
    start = Date.now() - 7 * 24 * 60 * 60 * 1000;
  } else if (timeDelimeter === TimeHistory.ONE_MONTH) {
    start = Date.now() - 30 * 7 * 24 * 60 * 60 * 1000;
  } else if (timeDelimeter === TimeHistory.THREE_MONTHS) {
    start = Date.now() - 3 * 30 * 7 * 24 * 60 * 60 * 1000;
  } else if (timeDelimeter === TimeHistory.SIX_MONTHS) {
    start = Date.now() - 6 * 30 * 7 * 24 * 60 * 60 * 1000;
  } else {
    start = Date.now() - 7 * 30 * 7 * 24 * 60 * 60 * 1000;
  }
  return [start, (Date.now() - start) / NUM_PER];
}

function createTrades(price: number, multiplier: number = 1) {
  const NUM_TRADES = 50;
  const trades: TokenTrade[] = [];
  let lastPrice = price;
  for (let i = 0; i < NUM_TRADES; i++) {
    lastPrice += Math.random() * multiplier;
    trades.push({
      price: lastPrice,
      quantity: Math.random() * 50,
    });
  }
  return trades;
}

function createPriceData(
  startPrice: number,
  volatility: number,
  timeHistory: TimeHistory = TimeHistory.ONE_DAY,
): {
  currentPrice: number;
  prices: TokenPrice;
  bids: TokenTrade[];
  asks: TokenTrade[];
} {
  // create data for past 3 months at 15 minute intervals, and then now
  const prices: { [timestamp: number]: number } = {};

  let [start, interval] = getDateStart(timeHistory);
  let lastPrice = startPrice;
  while (start < Date.now()) {
    lastPrice = generateNextPrice(lastPrice, volatility);
    prices[start] = lastPrice;
    start += interval;
  }

  const asks = createTrades(lastPrice);
  const bids = createTrades(lastPrice, -1);

  return {
    prices: {
      [timeHistory]: prices,
    },
    currentPrice: lastPrice,
    asks,
    bids,
  };
}

function createDummyData(): Token[] {
  return [
    {
      ticker: 'WAYNE',
      name: 'Wayne Inc.',
      ...createPriceData(432.53, 0.02),
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    },
    {
      ticker: 'STARK',
      name: 'Stark Industries',
      ...createPriceData(320.53, 0.02),
    },
    {
      ticker: 'PREY',
      name: 'Prey Foundation',
      ...createPriceData(21.34, 0.12),
    },
    {
      ticker: 'RUBI',
      name: 'Rubicon Governance',
      ...createPriceData(3.89, 0.14),
    },
  ];
}

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();

  const fetchTokens = useCallback(async () => {
    dispatch(fetchTokenList.pending());

    setTimeout(() => {
      // TODO: FIX THIS WITH AN ACTUAL BACK-END CALL
      const fakeData = createDummyData();
      dispatch(fetchTokenList.fulfilled(fakeData));
    }, 1000);
  }, []);

  // load in the tokens
  useEffect(() => {
    fetchTokens();
  }, []);

  return null;
}
