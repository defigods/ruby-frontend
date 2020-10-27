import { useIsTokenPending, useTokens } from '../state/tokens/hooks';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ERC20_INTERFACE } from '../constants/abis/erc20';
import { useEffect, useMemo, useState } from 'react';
import { getContract, getTokenAddress, requestAllowance } from '../utils';
import { useActiveWeb3React } from '.';
import { Pair } from '../types';
import { useQuotes } from '../state/quotes/hooks';
import { formatEther } from 'ethers/lib/utils';
import { markets } from '../config';
import { useTokenContract } from './contract';
import { useBlockNumber } from '../state/application/hooks';

export function useTokenAllowance(token: string): [number, boolean] {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(0);

  const { account: owner, chainId } = useActiveWeb3React();
  const spender = markets[chainId!].address;

  const tokenContract = useTokenContract(token);

  useEffect(() => {
    const fetchData = async () => {
      const result = await tokenContract?.functions.allowance(owner, spender);
      const formatted = Number(formatEther(result[0]));
      setResult(formatted);
      setLoading(false);
    };
    setLoading(true);
    fetchData();
  }, [token, owner, spender, tokenContract]);

  return [result, loading];
}

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

  const blockNumber = useBlockNumber();

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
            return [contract[0], Number(formatEther(amount))];
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
  }, [contracts, account, loading, blockNumber]);

  return [results, loading];
}
