import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { injected, walletlink } from '../connectors';
import { Web3Provider, Network } from '@ethersproject/providers';

export function useActiveWeb3React() {
  return useWeb3React<Web3Provider>();
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React(); // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        // **Need logic belwo to handle different connectors I think
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}
