import { useSelector } from 'react-redux';
import { AppState } from '..';
import { UserToken } from '../../types';

export function useDarkMode(): boolean {
  return useSelector((state: AppState) => state.user.darkMode);
}

export function useUserTokens(): UserToken[] {
  return useSelector((state: AppState) => state.user.tokens);
}

export function useIsUserTokenPending(): boolean {
  return useSelector((state: AppState) => state.user.loading);
}

export function useUserTotal(): number {
  const tokens = useUserTokens();

  return tokens.reduce(
    (total, next) => (total += next.quantity * next.currentPrice),
    0,
  );
}
