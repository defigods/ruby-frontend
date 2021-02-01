import { Contract, Event } from '@ethersproject/contracts';
import { formatEther, solidityKeccak256 } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { markets } from '../config';
import { useBlockNumber } from '../state/application/hooks';
import { useIsQuoteSelected, useSelectedQuote } from '../state/quotes/hooks';
import { useIsTokenPending, useTokens } from '../state/tokens/hooks';
import { UserTrade, UserTrades } from '../types';
import { getTokenAddress } from '../utils';
import { useMarketContract } from './contract';
import { BigNumber } from '@ethersproject/bignumber';
import { useTokenBalances } from './wallet';

async function loadUserHistoricTrade(
  token: string,
  quote: string,
  tokenAddress: string,
  quoteAddress: string,
  account: string,
  chainId: number,
  contract: Contract,
) {
  const buyPair = solidityKeccak256(
    ['address', 'address'],
    [tokenAddress, quoteAddress],
  );
  const sellPair = solidityKeccak256(
    ['address', 'address'],
    [quoteAddress, tokenAddress],
  );

  const mapKillToId = (events: Event[]) => {
    return events.map<string>((ev) => ev.args!['id'] as string);
  };

  const mapMakeToUserTrade = (
    events: Event[],
    isBuy: boolean,
    killedIds: string[],
  ) => {
    return events.map<UserTrade>((ev) => ({
      id: ev.args!['id'] as string,
      isBuy,
      completed: false,
      killed: killedIds.includes(ev.args!['id']),
      payGem: isBuy ? quote : token,
      buyGem: isBuy ? token : quote,
      payAmount: Number(formatEther(ev.args!['pay_amt'] as BigNumber)),
      buyAmount: Number(formatEther(ev.args!['buy_amt'] as BigNumber)),
      timestamp: (ev.args!['timestamp'] as BigNumber).toNumber(),
      transactionHash: ev['transactionHash'] as string,
    }));
  };

  const mapTakeToUserTrade = (events: Event[], isBuy: boolean) => {
    return events.map<UserTrade>((ev) => ({
      id: ev.args!['id'] as string,
      isBuy,
      completed: true,
      killed: false,
      payGem: isBuy ? quote : token,
      buyGem: isBuy ? token : quote,
      payAmount: Number(formatEther(ev.args!['give_amt'] as BigNumber)),
      buyAmount: Number(formatEther(ev.args!['take_amt'] as BigNumber)),
      timestamp: (ev.args!['timestamp'] as BigNumber).toNumber(),
      transactionHash: ev['transactionHash'] as string,
    }));
  };

  const startingBlock = markets[chainId].blockNumber;

  const sellMakesFilter = contract?.filters.LogTake(
    null,
    sellPair,
    account,
    null,
    null,
    null,
    null,
    null,
    null,
  )!;
  const sellTakesFilter = contract?.filters.LogTake(
    null,
    sellPair,
    null,
    null,
    null,
    account,
    null,
    null,
    null,
  )!;

  const buyMakesFilter = contract?.filters.LogTake(
    null,
    buyPair,
    account,
    null,
    null,
    null,
    null,
    null,
    null,
  )!;
  const buyTakesFilter = contract?.filters.LogTake(
    null,
    buyPair,
    null,
    null,
    null,
    account,
    null,
    null,
    null,
  )!;

  const possibleMakesBuyFilter = contract?.filters.LogMake(
    null,
    buyPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const possibleMakesSellFilter = contract?.filters.LogMake(
    null,
    sellPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const killedBuysFilter = contract?.filters.LogKill(
    null,
    buyPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const killedSellsFilter = contract?.filters.LogKill(
    null,
    sellPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const sells = [
    ...(await contract
      .queryFilter(sellMakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, false))),
    ...(await contract
      .queryFilter(sellTakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, false))),
  ];

  const buys = [
    ...(await contract
      .queryFilter(buyMakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, true))),
    ...(await contract
      .queryFilter(buyTakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, true))),
  ];

  const killedIds = [
    ...(await contract
      .queryFilter(killedBuysFilter, startingBlock)
      .then((re) => mapKillToId(re))),
    ...(await contract
      .queryFilter(killedSellsFilter, startingBlock)
      .then((re) => mapKillToId(re))),
  ];

  const incompleteSells = (
    await contract
      .queryFilter(possibleMakesSellFilter, startingBlock)
      .then((re) => mapMakeToUserTrade(re, false, killedIds))
  ).filter((item) => !sells.find((sell) => sell.id === item.id));
  const incompleteBuys = (
    await contract
      .queryFilter(possibleMakesBuyFilter, startingBlock)
      .then((re) => mapMakeToUserTrade(re, true, killedIds))
  ).filter((item) => !buys.find((sell) => sell.id === item.id));

  return {
    buys: [...buys, ...incompleteBuys],
    sells: [...sells, ...incompleteSells],
  };
}

/**
 * Load the historical trades of a user across all tokens
 */
export function useUserTrades(): [UserTrades, boolean] {
  const tokens = useTokens();
  const [balances, balancesLoading] = useTokenBalances();
  const quote = useSelectedQuote();
  const tokensLoading = useIsTokenPending();
  const quoteSelected = useIsQuoteSelected();
  const { chainId, account } = useActiveWeb3React();
  const contract = useMarketContract();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<UserTrades>({});

  const blockNumber = useBlockNumber();

  useEffect(() => {
    const fetchData = async () => {
      if (tokensLoading || !quoteSelected || !chainId || balancesLoading)
        return;
      // Loop through each token
      const quoteAddress = getTokenAddress(quote!, chainId)!;
      const results: UserTrades = {};
      for (const token of tokens) {
        const tokenAddress = getTokenAddress(token, chainId)!;
        results[token.ticker] = {
          ...(await loadUserHistoricTrade(
            token.ticker,
            quote!.ticker,
            tokenAddress,
            quoteAddress,
            account!,
            chainId,
            contract!,
          )),
          balance: Number(formatEther(balances[token.ticker] || '0')),
        };
      }
      setResults(results);
      setLoading(false);
    };
    setLoading(true);
    fetchData();
  }, [
    tokensLoading,
    quoteSelected,
    chainId,
    blockNumber,
    balancesLoading,
    account,
    balances,
    contract,
    quote,
    tokens,
  ]);

  return [results, loading];
}
