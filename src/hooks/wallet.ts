import { useIsTokenPending, useTokens } from '../state/tokens/hooks';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ERC20_INTERFACE } from '../constants/abis/erc20';
import { useEffect, useMemo, useState } from 'react';
import { getContract, getTokenAddress } from '../utils';
import { useActiveWeb3React } from '.';
import { Pair } from '../types';
import { useQuotes } from '../state/quotes/hooks';

export function useTokenBalances(): [{ [ticker: string]: number }, boolean] {
  const tokens = useTokens();
  const quotes = useQuotes();
  const tokensLoading = useIsTokenPending();
  const { chainId, account, library } = useActiveWeb3React();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ [ticker: string]: number }>({});

  const contracts = useMemo(() => {
    if (!library || !chainId || tokensLoading) return [];
    return [...tokens, ...quotes].map<Pair<string, Contract | undefined>>(
      (t) => {
        try {
          return [
            t.ticker,
            getContract(
              getTokenAddress(t, chainId!)!,
              ERC20_INTERFACE,
              library,
            ),
          ];
        } catch (error) {
          console.error('Failed to get contract', error);
          return [t.ticker, undefined];
        }
      },
    );
  }, [tokens, quotes, chainId, library, tokensLoading]);

  useEffect(() => {
    if (contracts.length === 0 || !account) return;

    const fetchData = async () => {
      const results = (await Promise.all(
        contracts
          .filter((contract) => {
            return contract[1] !== undefined;
          })
          .map(async (contract) => {
            const amount = (
              await contract[1]?.functions.balanceOf(account)
            )[0] as BigNumber;
            return [contract[0], amount.toNumber()];
          }),
      )) as Pair<string, number>[];
      setResults(
        results.reduce((accum, next) => {
          return {
            ...accum,
            [next[0]]: next[1],
          };
        }, {}),
      );
      setLoading(false);
    };

    fetchData();
  }, [contracts, account, loading]);

  return [results, loading];
}
