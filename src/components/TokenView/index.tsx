import React, { useState } from 'react';
import styled from 'styled-components';
import {
  useSelectedTimeHistory,
  useSelectedToken,
} from '../../state/tokens/hooks';
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

  const selectedTimeHistory = useSelectedTimeHistory();

  const [hoveredTimestamp, setHoveredTimestamp] = useState<number | undefined>(
    undefined,
  );

  if (!selectedToken) {
    return (
      <Wrapper>
        <Error>Select a token to get started</Error>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <HeaderView timestamp={hoveredTimestamp} />
      <LineChart
        data={selectedToken.prices[selectedTimeHistory]}
        onHover={setHoveredTimestamp}
      />
      <TimeHistorySelector />
    </Wrapper>
  );
}
