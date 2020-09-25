import React, { Suspense } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/Sidebar';
import Web3Wrapper from '../../components/Web3Wrapper';
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
  return (
    <Suspense fallback={null}>
      <HashRouter>
        <Web3Wrapper>
          <AppWrapper>
            <Sidebar />
            <BodyWrapper>
              <Switch>
                <Route exact strict path="/portfolio" component={Portfolio} />
                <Route exact strict path="/trade" component={Portfolio} />
                <Route exact strict path="/history" component={Portfolio} />
                <Redirect to="/portfolio" />
              </Switch>
            </BodyWrapper>
          </AppWrapper>
        </Web3Wrapper>
      </HashRouter>
    </Suspense>
  );
}
