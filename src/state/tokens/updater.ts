import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useWebSocket } from '../../components/SocketProvider';
import { useActiveWeb3React } from '../../hooks';
import { TimeHistoryEntry, Token, TokenTrade } from '../../types';
import { findTokenByAddress, getTokenAddress } from '../../utils';
import { useIsQuotePending, useSelectedQuote } from '../quotes/hooks';
import {
  fetchTokenList,
  fetchTokenTimeHistory,
  updateOrderBook,
  updatePrice,
} from './actions';
import { useSelectedTimeHistory, useSelectedToken, useTokens } from './hooks';

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

  const tokens = useTokens();

  useEffect(() => {
    if (!selectedToken || !quoteTicker) {
      return;
    }

    const quoteAddress = getTokenAddress(quoteTicker, chainId!);

    websocket.socket?.on(
      'UPDATE_PRICE',
      (
        networkId: number,
        baseAddress: string,
        _quoteAddress: string,
        price: number,
      ) => {
        if (quoteAddress !== _quoteAddress) {
          return;
        } else if (chainId !== networkId) {
          return;
        }

        const toUpdate = findTokenByAddress(baseAddress, tokens);
        if (!toUpdate) {
          return; // shouldn't happen... but type safety
        }

        dispatch(updatePrice([toUpdate, price]));
      },
    );

    websocket.socket?.on(
      'UPDATE_ORDER_BOOK',
      (
        networkId: number,
        baseAddress: string,
        _quoteAddress: string,
        orderBook: { buys: TokenTrade[]; sells: TokenTrade[] },
      ) => {
        if (quoteAddress !== _quoteAddress) {
          return; // don't update if we aren't using this currency
        } else if (networkId !== chainId) {
          return; // don't update if it is a different network
        }

        const toUpdate = findTokenByAddress(baseAddress, tokens);
        if (!toUpdate) {
          return; // shouldn't happen... but type safety
        }

        dispatch(updateOrderBook([toUpdate, orderBook]));
      },
    );

    return () => {
      websocket.socket?.off('UPDATE_ORDER_BOOK');
      websocket.socket?.off('UPDATE_PRICE');
    };
  }, [dispatch, chainId, quoteTicker, selectedToken, chainId]);

  return null;
}
