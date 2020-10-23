import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { useMemo } from 'react';
import { useActiveWeb3React } from '../hooks';
import { ContractOffer } from '../types';
import { formatEther } from 'ethers/lib/utils';

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
}

// account is not optional
export function getSigner(
  library: Web3Provider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string,
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
): Contract {
  if (address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any,
  );
}

// returns null on errors
export function useContract(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
): Contract | null {
  const { library, account } = useActiveWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined,
      );
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export async function getBestOffer(
  contract: Contract,
  sellGem: string,
  buyGem: string,
  isBuy: boolean = true,
): Promise<ContractOffer | undefined> {
  const offerId = (await contract.functions.getBestOffer(
    sellGem,
    buyGem,
  )) as number;

  const offer = await contract.functions.getOffer(offerId);
  const baseAddress = isBuy ? offer[3] : offer[1];
  const baseAmount = Number(
    formatEther((isBuy ? offer[2] : offer[0]) as BigNumber),
  );

  const quoteAddress = isBuy ? offer[1] : offer[3];
  const quoteAmount = Number(
    formatEther((isBuy ? offer[0] : offer[2]) as BigNumber),
  );

  if (baseAmount === 0 || quoteAmount === 0) {
    return undefined;
  }

  return {
    baseAddress,
    quoteAddress,
    baseAmount,
    quoteAmount,
    price: baseAmount / quoteAmount,
  };
}

// export async function parseTradeEvent(event: EventData): Promise<TradeEvent> {
//   const isBuy = await Token.isQuoteToken(event.returnValues['pay_gem']);

//   const baseAddress = isBuy
//     ? event.returnValues['buy_gem']
//     : event.returnValues['pay_gem'];
//   const quoteAddress = isBuy
//     ? event.returnValues['pay_gem']
//     : event.returnValues['buy_gem'];

//   const baseAmount = formatERC20Amount(
//     event.returnValues[isBuy ? 'buy_amt' : 'pay_amt'],
//   );
//   const quoteAmount = formatERC20Amount(
//     event.returnValues[isBuy ? 'pay_amt' : 'buy_amt'],
//   );

//   const price = baseAmount / quoteAmount;

//   return {
//     isBuy,
//     baseAddress,
//     quoteAddress,
//     baseAmount,
//     quoteAmount,
//     price,
//   };
// }
