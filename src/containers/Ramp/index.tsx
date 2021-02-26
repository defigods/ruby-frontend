import React from 'react';
import TokenList from '../../components/TokenList';
import HistoryPastTrades from '../../components/HistoryPastTrades';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import styled from 'styled-components';

const Ramp = styled.div``;
// https://docs.ramp.network/sdk-reference

export default function () {
  new RampInstantSDK({
    hostAppName: 'Rubicon',
    hostLogoUrl: 'https://yourdapp.com/yourlogo.png',
    swapAmount: '150000000000000000000', // 150 ETH in wei
    swapAsset: 'ETH',
    userAddress: 'user blockchain address',
  })
    .on('*', (event) => console.log(event))
    .show();

  return <>{/* <Ramp /> */}</>;
}
