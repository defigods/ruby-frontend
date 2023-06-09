import { useIsTokenPending, useTokens } from '../state/tokens/hooks';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ERC20_INTERFACE } from '../constants/abis/erc20';
import { useEffect, useMemo, useState } from 'react';
import { getContract, getTokenAddress } from '../utils';
import { useActiveWeb3React } from '.';
import { BaseToken, Pair } from '../types';
import { useQuotes } from '../state/quotes/hooks';
import { markets } from '../config';
import { useTokenContract } from './contract';
import { useBlockNumber } from '../state/application/hooks';
import Decimal from 'decimal.js';
import { formatUnits } from 'ethers/lib/utils';

export function useTokenAllowance(token: string): [BigNumber, boolean] {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<BigNumber>(BigNumber.from(0));

  const { account: owner, chainId } = useActiveWeb3React();
  const spender = markets[chainId!].address;

  const tokenContract = useTokenContract(token);
  const blockNumber = useBlockNumber();

  useEffect(() => {
    const fetchData = async () => {
      const result = await tokenContract?.functions.allowance(owner, spender);
      const formatted = result[0] as BigNumber;
      setResult(formatted);
      setLoading(false);
    };
    // setLoading(true);
    fetchData();
  }, [token, owner, spender, tokenContract, blockNumber]);

  return [result, loading];
}

export function useTokenBalances(): [{ [ticker: string]: Decimal }, boolean] {
  const tokens = useTokens();
  const quotes = useQuotes();
  const tokensLoading = useIsTokenPending();
  const { chainId, account, library } = useActiveWeb3React();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ [ticker: string]: Decimal }>({});

  const contracts = useMemo(() => {
    if (!library || !chainId || tokensLoading) return [];
    const combined: BaseToken[] = [...tokens, ...quotes];
    return combined.map<Pair<BaseToken, Contract | undefined>>((t) => {
      try {
        return [
          t,
          getContract(getTokenAddress(t, chainId!)!, ERC20_INTERFACE, library),
        ];
      } catch (error) {
        console.error('Failed to get contract', error);
        return [t, undefined];
      }
    });
  }, [tokens, quotes, chainId, library, tokensLoading]);

  const blockNumber = useBlockNumber();

  useEffect(() => {
    if (contracts.length === 0 || !account || loading) return;
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
            const raw = formatUnits(amount, contract[0].precision);
            return [contract[0].ticker, new Decimal(raw)];
          }),
      )) as Pair<string, Decimal>[];
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
    if (!Object.keys(results).length) setLoading(true);
    fetchData();
  }, [contracts, account, blockNumber]);

  return [results, loading];
}
