import { AddressZero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { useMemo } from 'react';
import { useActiveWeb3React } from '../hooks';
import { ContractOffer } from '../types';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import Decimal from 'decimal.js';

export async function cancelTrade(
  contract: Contract,
  id: string,
): Promise<TransactionResponse> {
  return contract.functions.cancel(id);
}

export async function loadTotalPrice(
  contract: Contract,
  token: string,
  quote: string,
  amount: BigNumber,
  isBuy: boolean,
): Promise<BigNumber> {
  return contract.functions[isBuy ? 'getPayAmount' : 'getBuyAmount'](
    quote,
    token,
    amount,
  ).then((result) => result[0] as BigNumber);
}

export async function executeLimitTrade(
  contract: Contract,
  payAmount: BigNumber,
  payGem: string,
  buyAmount: BigNumber,
  buyGem: string,
): Promise<TransactionResponse> {
  return contract.functions['offer(uint256,address,uint256,address,uint256)'](
    payAmount,
    payGem,
    buyAmount,
    buyGem,
    parseUnits('0', 18),
  );
}

export async function executeMatchTrade(
  contract: Contract,
  buyGem: string,
  payGem: string,
  amount: BigNumber,
  maxFill: BigNumber,
): Promise<TransactionResponse> {
  return contract.functions.buyAllAmount(buyGem, amount, payGem, maxFill);
}

export function getLibrary(provider: any): Web3Provider {
  return new Web3Provider(provider);
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
  tokenPrecision: number,
  quotePrecision: number,
  isBuy: boolean = true,
): Promise<ContractOffer | undefined> {
  const offerId = (await contract.functions.getBestOffer(
    _payGem,
    _buyGem,
  )) as number;

  const offer = await contract.functions.getOffer(offerId);
  const payAmount = offer[0] as BigNumber;
  const payGem = offer[1];
  const buyAmount = offer[2] as BigNumber;
  const buyGem = offer[3];

  const baseAddress = isBuy ? buyGem : payGem;
  const baseAmount = isBuy ? buyAmount : payAmount;

  const quoteAddress = isBuy ? payGem : buyGem;
  const quoteAmount = isBuy ? payAmount : buyAmount;

  if (baseAmount.isZero() || quoteAmount.isZero()) {
    return undefined;
  }

  // Must convert the BigNumbers to a decimal precision because the BN.js library does not support floating points
  const price = new Decimal(formatUnits(quoteAmount, quotePrecision))
    .div(formatUnits(baseAmount, tokenPrecision))
    .toNumber();

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
