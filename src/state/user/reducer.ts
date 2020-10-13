import { createReducer } from '@reduxjs/toolkit';
import { UserToken } from '../../types';
import { fetchUserTokenList, updateDarkMode } from './actions';

export interface UserState {
  readonly tokens: UserToken[];
  readonly darkMode: boolean;
  readonly loading: boolean;
  readonly error?: Error;
  readonly quoteTicker: string;
}

const initialState: UserState = {
  tokens: [],
  darkMode: true,
  loading: true,
  error: undefined,
  quoteTicker: 'DAI',
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchUserTokenList.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchUserTokenList.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        tokens: action.payload,
        error: undefined,
      };
    })
    .addCase(fetchUserTokenList.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
        tokens: [],
      };
    })
    .addCase(updateDarkMode, (state, action) => {
      return {
        ...state,
        darkMode: action.payload,
      };
    }),
);
