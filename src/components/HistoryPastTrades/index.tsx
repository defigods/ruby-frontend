import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
`;


export default function () {
  return (
    <Wrapper>
      Past Trades
    </Wrapper>
  );
}
