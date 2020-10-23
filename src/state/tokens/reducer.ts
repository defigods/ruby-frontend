import { createReducer } from '@reduxjs/toolkit';
import { TimeHistory, Token } from '../../types';
import {
  fetchTokenList,
  fetchTokenTimeHistory,
  selectTimeHistory,
  selectToken,
} from './actions';

export interface TokensState {
  readonly tokens: Token[];
  readonly selected?: string;
  readonly loading: boolean;
  readonly error?: Error;
  readonly selectedTimeHistory: TimeHistory;
  readonly timeHistoryLoading: boolean;
}

const initialState: TokensState = {
  tokens: [],
  selected: undefined,
  loading: true,
  error: undefined,
  selectedTimeHistory: TimeHistory.ONE_DAY,
  timeHistoryLoading: false,
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
    })
    .addCase(fetchTokenTimeHistory.pending, (state, action) => {
      return {
        ...state,
        timeHistoryLoading: true,
      };
    })
    .addCase(fetchTokenTimeHistory.fulfilled, (state, action) => {
      const selectedToken = state.tokens.find(
        (t) => t.ticker === state.selected,
      )!;
      const newTokens = state.tokens.filter((t) => t.ticker !== state.selected);
      return {
        ...state,
        timeHistoryLoading: false,
        tokens: [
          ...newTokens,
          {
            ...selectedToken,
            prices: {
              ...selectedToken.prices,
              [state.selectedTimeHistory]: action.payload,
            },
          },
        ],
      };
    })
    .addCase(fetchTokenTimeHistory.rejected, (state, action) => {
      return {
        ...state,
        timeHistoryLoading: false,
      };
    }),
);
