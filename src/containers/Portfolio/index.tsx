import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import PortfolioView from '../../components/PortfolioView';
import TokenList from '../../components/TokenList';
import { AppDispatch } from '../../state';
import { selectToken } from '../../state/tokens/actions';
import { useIsTokenSelected } from '../../state/tokens/hooks';
import { useIsUserTokenPending, useUserTokens } from '../../state/user/hooks';
import { useUserTrades } from '../../hooks/trades';

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
  const [ordersData, loading] = useUserTrades();

  useEffect(() => {
    if (!tokenSelected && userTokens.length > 0) {
      dispatch(selectToken(userTokens[0].ticker));
    }
  }, [tokenSelected, userTokens, dispatch]);

  const data = userTokens.map((t) => ({
    ...t,
    title: t.ticker,
    subtitle: `${t.quantity.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TOKENS`,
  }));

  // console.log('userTrades', ordersData);
  // console.log('userTokens', userTokens);

  const oustandingOrdersData = useMemo(() => {
    if (loading) {
      return [];
    }

    for (let i = 0; i < userTokens.length; i++) {
      const ordersByToken = ordersData[userTokens[i]['ticker']];
      console.log(ordersByToken);
      for (let b = 0; b < ordersByToken['buys'].length; b++) {
        if (
          !ordersByToken['buys'][b]['completed'] &&
          !ordersByToken['buys'][b]['killed']
        ) {
          console.log('Outstanding order: ', ordersByToken['buys'][b]);
          // if (ordersByToken['buys'][b]['isBuy']) {
          //    //**append buy Amount to portfolio data */
          //}
          // else {
          //     // ** append sell amount to portfolio data **
          //}
        }
      }
    }
  }, [loading, ordersData, userTokens]);

  console.log('target data', oustandingOrdersData);

  // const outstandingOrdersData = ordersData.map((token) => ({
  //   console.log(token);
  // }));

  return (
    <>
      {userPending ? (
        <LoaderWrapper>
          <Loader size="50px" />
        </LoaderWrapper>
      ) : (
        <>
          <TokenList data={data} searchBar={false} selectable={false} />
          <PortfolioView />
        </>
      )}
    </>
  );
}
