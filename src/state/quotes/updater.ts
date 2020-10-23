import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useWebSocket } from '../../components/SocketProvider';
import { useActiveWeb3React } from '../../hooks';
import { QuoteToken } from '../../types';
import { fetchQuoteList, selectQuoteToken } from './actions';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();
  const { chainId } = useActiveWeb3React();
  const websocket = useWebSocket();

  useEffect(() => {
    if (websocket.loading || !chainId) return;
    dispatch(fetchQuoteList.pending());
    websocket.socket?.emit(
      'LOAD_QUOTE_TOKENS',
      chainId,
      (quotes: QuoteToken[]) => {
        dispatch(selectQuoteToken(quotes[0].ticker));
        dispatch(fetchQuoteList.fulfilled(quotes));
      },
    );
  }, [dispatch, websocket.loading, chainId]);

  return null;
}
