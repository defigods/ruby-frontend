import { createReducer } from '@reduxjs/toolkit';
import { TimeHistory, Token } from '../../types';
import { fetchTokenList, selectTimeHistory, selectToken } from './actions';

export interface TokensState {
  readonly tokens: Token[];
  readonly selected?: string;
  readonly loading: boolean;
  readonly error?: Error;
  readonly selectedTimeHistory: TimeHistory;
}

const initialState: TokensState = {
  tokens: [],
  selected: undefined,
  loading: true,
  error: undefined,
  selectedTimeHistory: TimeHistory.ONE_DAY,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchTokenList.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        error: undefined,
        tokens: action.payload,
      };
    })
    .addCase(fetchTokenList.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    })
    .addCase(selectToken, (state, action) => {
      return {
        ...state,
        selected: action.payload,
      };
    })
    .addCase(selectTimeHistory, (state, action) => {
      return {
        ...state,
        selectedTimeHistory: action.payload,
      };
    }),
);
