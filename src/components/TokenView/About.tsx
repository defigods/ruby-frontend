import React from 'react';
import styled from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
  padding: 0;
  font-size: 20px;
  margin-bottom: 15px;
`;

const Body = styled.p`
  margin: 0;
  padding: 0;
  font-size: 12px;

  color: ${({ theme }) => theme.text.secondary};
`;

const DEFAULT =
  'No description for this token found. View on Etherscan to find out more.';

export default function () {
  const token = useSelectedToken();

  return (
    <Wrapper>
      <Title>About</Title>
      <Body>{token?.description || DEFAULT}</Body>
    </Wrapper>
  );
}
