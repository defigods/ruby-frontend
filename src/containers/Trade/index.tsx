import React from 'react';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import TokenList from '../../components/TokenList';
import TokenView from '../../components/TokenView';
import { useTokens, useIsTokenPending } from '../../state/tokens/hooks';

const LoaderWrapper = styled.div`
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

export default function () {
  const tokens = useTokens();
  const tokensPending = useIsTokenPending();

  const data = tokens.map((t) => ({
    ...t,
    title: t.ticker,
    subtitle: t.name,
  }));

  return (
    <>
      {tokensPending ? (
        <LoaderWrapper>
          <Loader size="50px" />
        </LoaderWrapper>
      ) : (
        <>
          <TokenList data={data} searchBar={true} />
          <TokenView />
        </>
      )}
    </>
  );
}
