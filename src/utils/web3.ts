import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useActiveWeb3React } from '../hooks';

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
