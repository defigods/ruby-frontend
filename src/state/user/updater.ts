import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useTokenBalances } from '../../hooks/wallet';
import { UserToken } from '../../types';
import { useIsTokenPending, useTokens } from '../tokens/hooks';
import { fetchUserTokenList } from './actions';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();

  const isTokenPending = useIsTokenPending();

  const tokens = useTokens();

  const [userTokens, userTokensLoading] = useTokenBalances();

  const fetchTokens = useCallback(async () => {
    dispatch(fetchUserTokenList.pending());

    if (isTokenPending || userTokensLoading) return;

    const toDispatch = Object.keys(userTokens).map<UserToken>((ticker) => {
      const token = tokens.find((t) => t.ticker === ticker)!;
      return {
        ...token,
        quantity: userTokens[ticker],
      };
    });

    dispatch(fetchUserTokenList.fulfilled(toDispatch));
  }, [dispatch, isTokenPending, tokens, userTokens, userTokensLoading]);

  // load in the tokens
  useEffect(() => {
    fetchTokens();
  }, [isTokenPending, fetchTokens, userTokensLoading]);

  return null;
}
