import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useSelectedTimeHistory } from '../../state/tokens/hooks';
import HeaderView from './HeaderView';
import LineChart from '../LineChart';
import TimeHistorySelector from '../TimeHistorySelector';
import HoldingsView from './HoldingsView';
import { useWebSocket } from '../SocketProvider';
import { useUserTrades } from '../../hooks/trades';
import { TimeHistoryEntry } from '../../types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../state';
import { fetchPortfolio } from '../../state/portfolio/actions';
import {
  useIsPortfolioLoaded,
  useIsPortfolioPending,
  usePortfolioData,
} from '../../state/portfolio/hooks';
import { useSelectedQuote } from '../../state/quotes/hooks';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100% - 40px);
  margin: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  height: 100%;
  overflow: hidden;
`;

export default function () {
  const { chainId } = useActiveWeb3React();

  const selectedTimeHistory = useSelectedTimeHistory();

  const [hoveredTimestamp, setHoveredTimestamp] = useState<number | undefined>(
    undefined,
  );

  const websocket = useWebSocket();
  const [userTrades, userTradesLoading] = useUserTrades();
  const dispatch = useDispatch<AppDispatch>();
  const portfolioLoaded = useIsPortfolioLoaded();
  const portfolioPending = useIsPortfolioPending();
  const selectedQuote = useSelectedQuote();

  useEffect(() => {
    if (userTradesLoading || !chainId || portfolioLoaded || !selectedQuote)
      return;
    dispatch(fetchPortfolio.pending());
    websocket.socket?.emit(
      'LOAD_PORTFOLIO',
      chainId,
      selectedTimeHistory,
      selectedQuote.ticker,
      userTrades,
      (entry: TimeHistoryEntry) => {
        dispatch(fetchPortfolio.fulfilled([selectedTimeHistory, entry]));
      },
    );
  }, [
    userTradesLoading,
    chainId,
    selectedTimeHistory,
    dispatch,
    portfolioLoaded,
    selectedQuote,
    userTrades,
    websocket.socket,
  ]);

  const data = usePortfolioData();

  return (
    <Wrapper>
      <HeaderView timestamp={hoveredTimestamp} entry={data} />
      <LineChart
        data={data}
        onHover={setHoveredTimestamp}
        loading={portfolioPending}
      />
      <TimeHistorySelector />
      <BottomWrapper>
        <HoldingsView />
      </BottomWrapper>
    </Wrapper>
  );
}
