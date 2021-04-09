import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/Sidebar';
import { useActiveWeb3React, useEagerConnect } from '../../hooks';
import Trade from '../Trade';
import History from '../History';
import Onboarding from '../../components/Onboarding';
import { useWebSocket } from '../../components/SocketProvider';
import Loader, { LoaderWrapper } from '../../components/Loader';
import Portfolio from '../Portfolio';

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
  const { account, chainId } = useActiveWeb3React();

  useEffect(() => {
    console.log('chain ID: ', chainId);
    if (chainId !== 42) {
      window.alert(
        'this is not kovan network, please change the kovan network',
      );
    }
  }, [chainId]);

  const websocket = useWebSocket();
  const hasTried = useEagerConnect();

  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <AppWrapper>
          <Sidebar />
          <BodyWrapper>
            {websocket.loading || !hasTried ? (
              <LoaderWrapper style={{ height: '100vh' }}>
                <Loader size="100px" />
              </LoaderWrapper>
            ) : (
              <Switch>
                {!!account && chainId == 42 ? (
                  <>
                    <Route
                      exact
                      strict
                      path="/portfolio"
                      component={Portfolio}
                    />
                    <Route exact strict path="/trade" component={Trade} />
                    <Route exact strict path="/history" component={History} />
                    <Redirect to="/trade" />
                  </>
                ) : (
                  <>
                    <Onboarding />
                    <Route exact strict path="/no-wallet" component={Trade} />
                    <Redirect to="/no-wallet" />
                  </>
                )}
              </Switch>
            )}
          </BodyWrapper>
        </AppWrapper>
      </BrowserRouter>
    </Suspense>
  );
}
