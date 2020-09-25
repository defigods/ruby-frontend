import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  createAction,
} from '@reduxjs/toolkit';
import { TimeHistory, Token } from '../../types';

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<Token[]>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('tokens/fetchTokenList/pending'),
  fulfilled: createAction('tokens/fetchTokenList/fulfilled'),
  rejected: createAction('tokens/fetchTokenList/rejected'),
};

export const selectToken = createAction<string>('tokens/select');
export const selectTimeHistory = createAction<TimeHistory>(
  'tokens/selectTimeHistory',
);
