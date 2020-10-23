import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useWebSocket } from '../../components/SocketProvider';
import { useActiveWeb3React } from '../../hooks';
import { TimeHistoryEntry, Token } from '../../types';
import { useIsQuotePending, useSelectedQuote } from '../quotes/hooks';
import { fetchTokenList, fetchTokenTimeHistory } from './actions';
import { useSelectedTimeHistory, useSelectedToken } from './hooks';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();
  const { chainId } = useActiveWeb3React();
  const websocket = useWebSocket();
  const quotesLoading = useIsQuotePending();
  const quoteTicker = useSelectedQuote();

  useEffect(() => {
    if (websocket.loading || !chainId || quotesLoading || !quoteTicker) return;
    dispatch(fetchTokenList.pending());
    websocket.socket?.emit(
      'LOAD_TOKENS',
      chainId,
      quoteTicker.ticker,
      (tokens: Token[]) => {
        dispatch(fetchTokenList.fulfilled(tokens));
      },
    );
  }, [dispatch, websocket.loading, chainId, quoteTicker, quotesLoading]);

  const selectedToken = useSelectedToken();
  const timeHistory = useSelectedTimeHistory();

  useEffect(() => {
    if (!selectedToken || !quoteTicker) {
      return;
    }

    if (!(timeHistory in selectedToken.prices)) {
      dispatch(fetchTokenTimeHistory.pending());
      websocket.socket?.emit(
        'LOAD_TIME_HISTORY',
        chainId,
        selectedToken.ticker,
        quoteTicker.ticker,
        timeHistory,
        (timeHistoryEntry: TimeHistoryEntry) => {
          dispatch(fetchTokenTimeHistory.fulfilled(timeHistoryEntry));
        },
      );
    }
  }, [dispatch, chainId, quoteTicker, selectedToken, timeHistory]);

  // // load in the tokens
  // useEffect(() => {
  //   fetchTokens();
  // }, [fetchTokens, websocket.loading]);

  return null;
}
