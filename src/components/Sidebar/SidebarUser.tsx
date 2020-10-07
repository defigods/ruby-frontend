import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { ChevronUp } from 'react-feather';
import styled from 'styled-components';
import { useBlockNumber } from '../../state/application/hooks';
import { shortenAddress } from '../../utils';
import Identicon from '../Identicon';

const NETWORK_LABELS: { [key: number]: string } = {
  4: 'Rinkeby',
  3: 'Ropsten',
  5: 'Görli',
  1: 'Mainnet',
  42: 'Kovan',
};

const Wrapper = styled.div`
  margin-top: auto;
  position: relative;
  display: flex;
  justify-content: left;
  padding: 15px 15px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const NetworkCard = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 5px;
  opacity: 0.9;
  font-size: 9px;
  top: -30px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.againstRed};
  background-color: ${({ theme }) => theme.colors.tertiary};
  padding: 5px 10px;
  white-space: nowrap;
`;

const StyledChevronsUp = styled(ChevronUp)`
  margin-left: auto;
`;

const UserText = styled.span`
  margin-left: 10px;
  font-size: 12px;
`;

export default function () {
  const { account, chainId } = useWeb3React();
  const blockNumber = useBlockNumber();

  return (
    <Wrapper>
      {chainId && NETWORK_LABELS[chainId] && (
        <NetworkCard>
          {NETWORK_LABELS[chainId]} ({blockNumber})
        </NetworkCard>
      )}
      <Identicon />
      <UserText>{shortenAddress(account!)}</UserText>
      <StyledChevronsUp size={14} />
    </Wrapper>
  );
}
