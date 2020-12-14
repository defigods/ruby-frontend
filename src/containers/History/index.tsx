import React from 'react';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import TokenList from '../../components/TokenList';
import HistoryPastTrades from '../../components/HistoryPastTrades';
import { useTokens, useIsTokenPending } from '../../state/tokens/hooks';
import { useUserTrades } from '../../hooks/trades';

const HistoryTokenWrapper = styled.div`
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

export default function () {
  const tokens = useTokens();
  const tokensPending = useIsTokenPending();

  const info = useUserTrades();

  const data = tokens.map((t) => ({
    ...t,
    title: t.ticker,
    subtitle: ``, // TODO: Fix this?
  }));

  return (
    <>
      <TokenList data={data} searchBar={false} />
      <HistoryPastTrades />
    </>
  );
}
