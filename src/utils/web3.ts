import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { useMemo } from 'react';
import { useActiveWeb3React } from '../hooks';
import { ContractOffer } from '../types';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import { markets } from '../config';
import { MaxUint256 } from '@ethersproject/constants';

export async function executeTrade(
  contract: Contract,
  payAmount: string,
  payGem: string,
  buyAmount: string,
  buyGem: string,
) {
  contract.functions['offer(uint256,address,uint256,address,uint256)'](
    parseUnits(payAmount, 18),
    payGem,
    parseUnits(buyAmount, 18),
    buyGem,
    parseUnits('0', 18),
  ).then(() => {
    console.log('sent a thing');
  });
}

export async function executeMatch(
  contract: Contract,
  offer: ContractOffer,
  maxAmount: number,
) {
  contract.functions.buy(offer.id, parseUnits(`${maxAmount}`, 18)).then(() => {
    console.log('matched order');
  });
}

export async function requestAllowance(contract: Contract, chainId: number) {
  const spender = markets[chainId].address;
  contract.approve(spender, MaxUint256).then(() => {
    console.log('approved');
  });
}

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
  _payGem: string,
  _buyGem: string,
  isBuy: boolean = true,
): Promise<ContractOffer | undefined> {
  const offerId = (await contract.functions.getBestOffer(
    _payGem,
    _buyGem,
  )) as number;

  const offer = await contract.functions.getOffer(offerId);
  const payAmount = Number(formatEther(offer[0] as BigNumber));
  const payGem = offer[1];
  const buyAmount = Number(formatEther(offer[2] as BigNumber));
  const buyGem = offer[3];

  const baseAddress = isBuy ? buyGem : payGem;
  const baseAmount = isBuy ? buyAmount : payAmount;

  const quoteAddress = isBuy ? payGem : buyGem;
  const quoteAmount = isBuy ? payAmount : buyAmount;

  const price = quoteAmount / baseAmount;

  if (baseAmount === 0 || quoteAmount === 0) {
    return undefined;
  }

  return {
    payAmount,
    payGem,
    buyAmount,
    buyGem,
    baseAddress,
    quoteAddress,
    baseAmount,
    quoteAmount,
    price,
    id: offerId,
  };
}
