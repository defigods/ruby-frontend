import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { ChevronUp } from 'react-feather';
import styled from 'styled-components';
import { shortenAddress } from '../../utils';
import Identicon from '../Identicon';

const Wrapper = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: left;
  padding: 15px 15px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const StyledChevronsUp = styled(ChevronUp)`
  margin-left: auto;
`;

const UserText = styled.span`
  margin-left: 10px;
  font-size: 12px;
`;

export default function () {
  const { account } = useWeb3React();

  return (
    <Wrapper>
      <Identicon />
      <UserText>{shortenAddress(account!)}</UserText>
      <StyledChevronsUp size={14} />
    </Wrapper>
  );
}
