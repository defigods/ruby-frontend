import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-montserrat';
import * as serviceWorker from './serviceWorker';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from './utils';
import store from './state';
import { Provider } from 'react-redux';
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme';
import App from './containers/App';
import ApplicationUpdater from './state/application/updater';
import TokensUpdater from './state/tokens/updater';
import UserUpdater from './state/user/updater';

const Updaters = () => {
  return (
    <>
      <ApplicationUpdater />
      <TokensUpdater />
      <UserUpdater />
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Provider store={store}>
        <Updaters />
        <ThemeProvider>
          <ThemedGlobalStyle />
          <App />
        </ThemeProvider>
      </Provider>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
