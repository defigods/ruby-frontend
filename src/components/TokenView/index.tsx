import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';
import { TimeHistory } from '../../types';
import HeaderView from './HeaderView';
import LineChart from './LineChart';
import TimeHistorySelector from './TimeHistorySelector';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const Error = styled.h2`
  color: ${({ theme }) => theme.colors.tertiary};
`;

export default function () {
  const selectedToken = useSelectedToken();

  const [selectedTimeHistory, setTimeHistory] = useState(TimeHistory.ONE_DAY);

  if (!selectedToken) {
    return (
      <Wrapper>
        <Error>Select a token to get started</Error>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <HeaderView />
      <LineChart data={selectedToken.prices[selectedTimeHistory]} />
      <TimeHistorySelector
        selectedTime={selectedTimeHistory}
        onSelect={setTimeHistory}
      />
    </Wrapper>
  );
}
