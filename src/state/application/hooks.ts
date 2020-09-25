import { useWeb3React } from '@web3-react/core';
import { useSelector } from 'react-redux';
import { AppState } from '..';

export function useBlockNumber(): number | undefined {
  const { chainId } = useWeb3React();

  return useSelector(
    (state: AppState) => state.application.blockNumber[chainId ?? -1],
  );
}
