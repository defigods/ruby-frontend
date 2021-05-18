import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
//
const RPC_URLS = {
  1: 'https://mainnet.infura.io/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
  4: 'https://rinkeby.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150', //these are not ours
  42: 'https://kovan.infura.io/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
};

export const injected = new InjectedConnector({
  supportedChainIds: [42, 1],
});

export const walletLink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appLogoUrl: 'https://app.rubicon.finance/logo.png',
  appName: 'Rubicon',
});

export const walletConnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 42: RPC_URLS[42] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

// Bug fix for walletConnect - https://github.com/NoahZinsmeister/web3-react/issues/124
// Keep track of this issue in order to remove this once is fixed on the package
export const resetWalletConnector = (connector: AbstractConnector) => {
  if (
    connector &&
    connector instanceof WalletConnectConnector &&
    connector.walletConnectProvider?.wc?.uri
  ) {
    connector.walletConnectProvider = undefined;
  }
};
