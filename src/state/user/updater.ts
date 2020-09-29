import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useIsTokenPending, useTokens } from '../tokens/hooks';
import { fetchUserTokenList } from './actions';

function createDummyData(suffix: string = '') {
  return [
    {
      ticker: 'WAYNE' + suffix,
      quantity: 430.32,
    },
    {
      ticker: 'STARK' + suffix,
      quantity: 314.45,
    },
    {
      ticker: 'PREY' + suffix,
      quantity: 0.4392,
    },
    {
      ticker: 'RUBI' + suffix,
      quantity: 404.50291,
    },
  ];
}

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();

  const isTokenPending = useIsTokenPending();

  const tokens = useTokens();

  const fetchTokens = useCallback(async () => {
    dispatch(fetchUserTokenList.pending());

    if (isTokenPending) return;

    setTimeout(() => {
      // TODO: FIX THIS WITH AN ACTUAL BACK-END CALL
      dispatch(
        fetchUserTokenList.fulfilled(
          [...createDummyData(), ...createDummyData('_2')].map((d) => ({
            ...tokens.find((t) => t.ticker === d.ticker)!,
            quantity: d.quantity,
          })),
        ),
      );
    }, 1000);
  }, [dispatch, isTokenPending, tokens]);

  // load in the tokens
  useEffect(() => {
    fetchTokens();
  }, [isTokenPending, fetchTokens]);

  return null;
}
