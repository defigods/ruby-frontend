import { useSelector } from 'react-redux';
import { AppState } from '..';
import { QuoteToken } from '../../types';

export function useQuotes(): QuoteToken[] {
  return useSelector((state: AppState) => state.quotes.quotes);
}

export function useIsQuoteSelected(): boolean {
  return useSelector((state: AppState) => !!state.quotes.selected);
}

export function useSelectedQuote(): QuoteToken | undefined {
  return useSelector((state: AppState) => {
    return state.quotes.quotes.find((t) => t.ticker === state.quotes.selected);
  });
}

export function useIsQuotePending(): boolean {
  return useSelector((state: AppState) => state.quotes.loading);
}
