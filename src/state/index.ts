import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import application from './application/reducer';
import tokens from './tokens/reducer';
import user from './user/reducer';
import quotes from './quotes/reducer';
import settings from './settings/reducer';

const PERSISTENT_KEYS: string[] = ['settings'];

const store = configureStore({
  reducer: {
    application,
    tokens,
    user,
    quotes,
    settings,
  },
  middleware: [
    ...getDefaultMiddleware({ thunk: false }),
    save({ states: PERSISTENT_KEYS }),
  ],
  preloadedState: load({ states: PERSISTENT_KEYS }),
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
