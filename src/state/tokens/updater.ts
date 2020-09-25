import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { TimeHistory, Token, TokenPrice } from '../../types';
import { fetchTokenList } from './actions';

function generateNextPrice(price: number, volatility: number): number {
  const rnd = Math.random(); // generate number, 0 <= x < 1.0
  let change_percent = 2 * volatility * rnd;
  if (change_percent > volatility) change_percent -= 2 * volatility;
  const change_amount = price * change_percent;
  return price + change_amount;
}

function getDateStart(timeDelimeter: TimeHistory): [number, number] {
  const NUM_PER = 20;
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

function createPriceData(
  startPrice: number,
  volatility: number,
  timeHistory: TimeHistory = TimeHistory.ONE_DAY,
): TokenPrice {
  // create data for past 3 months at 15 minute intervals, and then now
  const prices: { [timestamp: number]: number } = {};

  let [start, interval] = getDateStart(timeHistory);
  let lastPrice = startPrice;
  while (start < Date.now()) {
    prices[start] = lastPrice;
    start += interval;
    lastPrice = generateNextPrice(lastPrice, volatility);
  }

  return {
    [timeHistory]: prices,
  };
}

function createDummyData(): Token[] {
  return [
    {
      ticker: 'WAYNE',
      name: 'Wayne Inc.',
      currentPrice: 432.53,
      prices: createPriceData(432.53, 0.02),
    },
    {
      ticker: 'STARK',
      name: 'Stark Industries',
      currentPrice: 320.52,
      prices: createPriceData(320.53, 0.02),
    },
    {
      ticker: 'PREY',
      name: 'Prey Foundation',
      currentPrice: 21.34,
      prices: createPriceData(21.34, 0.12),
    },
    {
      ticker: 'RUBI',
      name: 'Rubicon Governance',
      currentPrice: 3.89,
      prices: createPriceData(3.89, 0.14),
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
