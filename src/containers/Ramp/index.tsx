import React from 'react';
import TokenList from '../../components/TokenList';
import HistoryPastTrades from '../../components/HistoryPastTrades';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';

// https://docs.ramp.network/sdk-reference

export default function () {
  const { account, chainId } = useActiveWeb3React();

  new RampInstantSDK({
    hostAppName: 'Rubicon',
    hostLogoUrl:
      'https://user-images.githubusercontent.com/32072172/109361232-34969c80-784e-11eb-9b4d-91c09806eec1.png',
    swapAmount: '100000000000000000', // .1 ETH in wei
    swapAsset: 'ETH',
    userAddress: String(account),
  })
    .on('*', (event) => console.log(event))
    .show();

  return <></>;
}
