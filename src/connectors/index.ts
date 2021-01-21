import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

//
const RPC_URLS = {
  1: 'https://mainnet.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150', //these are not ours
  4: 'https://rinkeby.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150', //these are not ours
  42: 'https://kovan.infura.io/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
};

export const injected = new InjectedConnector({
  supportedChainIds: [42, 1],
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[42],
  // appLogoUrl: "need to add this",
  appName: 'Rubicon',
});
