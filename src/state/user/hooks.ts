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
