import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import TokenList from '../../components/TokenList';
import TokenView from '../../components/TokenView';
import { AppDispatch } from '../../state';
import { selectToken } from '../../state/tokens/actions';
import { useIsTokenSelected } from '../../state/tokens/hooks';
import { useIsUserTokenPending, useUserTokens } from '../../state/user/hooks';

const LoaderWrapper = styled.div`
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

export default function () {
  const dispatch = useDispatch<AppDispatch>();
  const userTokens = useUserTokens();
  const userPending = useIsUserTokenPending();
  const tokenSelected = useIsTokenSelected();

  useEffect(() => {
    if (!tokenSelected && userTokens.length > 0) {
      dispatch(selectToken(userTokens[0].ticker));
    }
  }, [tokenSelected, userTokens, dispatch]);

  const data = userTokens.map((t) => ({
    ...t,
    title: t.ticker,
    subtitle: `${t.quantity} TOKENS`,
  }));

  return (
    <>
      {userPending ? (
        <LoaderWrapper>
          <Loader size="50px" />
        </LoaderWrapper>
      ) : (
        <>
          <TokenList data={data} />
          <TokenView />
        </>
      )}
    </>
  );
}
