import React from 'react';
import styled from 'styled-components';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useWeb3React } from '@web3-react/core';

const StyledIdenticonContainer = styled(Jazzicon)`
  height: 2rem;
  width: 2rem;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
`;

export default function Identicon() {
  const { account } = useWeb3React();

  return <StyledIdenticonContainer address={account!} />;
}
