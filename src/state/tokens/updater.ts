import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useWebSocket } from '../../components/SocketProvider';
import { useActiveWeb3React } from '../../hooks';
import { Token } from '../../types';
import { useIsQuotePending, useSelectedQuote } from '../quotes/hooks';
import { fetchTokenList } from './actions';

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

  // // load in the tokens
  // useEffect(() => {
  //   fetchTokens();
  // }, [fetchTokens, websocket.loading]);

  return null;
}
