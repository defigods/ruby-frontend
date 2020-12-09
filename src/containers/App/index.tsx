import React, { Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import Sidebar from '../../components/Sidebar';
import Web3Wrapper from '../../components/Web3Wrapper';
import { useActiveWeb3React } from '../../hooks';
import Trade from '../Trade';
import Portfolio from '../Portfolio';
import Onboarding from '../../components/Onboarding';

const AppWrapper = styled.div`
  display: flex;
  flex-flow: row;
  align-items: flex-start;
  overflow-x: hidden;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
`;

export default function () {
  const { account } = useActiveWeb3React();
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        {/* <Web3Wrapper> */}
        <AppWrapper>
          <Sidebar />
          <BodyWrapper>
            {!!account ? (
              <Switch>
                <Route exact strict path="/portfolio" component={Portfolio} />
                <Route exact strict path="/trade" component={Trade} />
                <Route exact strict path="/history" component={Trade} />
                <Redirect to="/trade" />
              </Switch>
            ) : (
              <Switch>
                <Onboarding />
                <Route exact strict path="/no-wallet" component={Trade} />
                <Redirect to="/no-wallet" />
              </Switch>
            )}
          </BodyWrapper>
        </AppWrapper>
        {/* </Web3Wrapper> */}
      </BrowserRouter>
    </Suspense>
  );
}
