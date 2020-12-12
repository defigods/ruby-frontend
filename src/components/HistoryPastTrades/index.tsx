import React from 'react';
import styled from 'styled-components';
import { UserTrades } from '../../types';
import Loader from '../Loader';
import PastTradeItem from './pastTradeItem';

interface HistoryPastTradesProps {
  data: [UserTrades, boolean];
}

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
`;

const HistoryHeader = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const PastTradesWrapper = styled.div`
  height: 100%;
  padding: 10px 70px 10px 70px;
`;

const HistoryHeaderItem = styled.div`
  padding: 15px 110px 15px 110px;
`;

const NoSearchBarHeader = styled.div`
  // position: relative;
  // display: flex;
  align-items: center;
  width: 100%;
  height: 55px;
  text-align: center;
  padding: 20px;
  font-weight: bold;
`;

//TODO: Receive all data of past Trades
// This could be a web3 call parsing through LogTakes[2] = seller and
// LogTakes[6] = Buyer and the trade data is there....
//  This lends me to think that the user should incur web3 calls to check their
//  price history... TODO: Need to throw a loading while loading in the history
//TODO: Display that data into the scrolling chart depicted in mockup

//data passed into component should be token, BUY/Sell, Size, Tx hash

//take in data - ******make sure data[1] is false*****
//Map array -> PastTradeItem

export default function (props: HistoryPastTradesProps) {
  console.log('data prop', props.data);

  const [pastTradesData, loadingHistory] = props.data;

  console.log('pastTradesData', pastTradesData);
  console.log('pastTradesData[0', pastTradesData['STARK']);

  //turn pastTradesData into an array to then map -> Past Trade Item below
  // sortedData;

  return (
    <Wrapper>
      <NoSearchBarHeader>Trade History</NoSearchBarHeader>
      <HistoryHeader>
        <HistoryHeaderItem>Token</HistoryHeaderItem>
        <HistoryHeaderItem>Action</HistoryHeaderItem>
        <HistoryHeaderItem>Size</HistoryHeaderItem>
        <HistoryHeaderItem>Details</HistoryHeaderItem>
      </HistoryHeader>

      {loadingHistory ? (
        <Loader />
      ) : (
        <PastTradesWrapper>
          {/* Need to map the sorted Data to each past Trade Items */}
          <PastTradeItem
            token={'Test'}
            action={'Buy'}
            size={5}
            details={'googl.com'}
          ></PastTradeItem>
        </PastTradesWrapper>
      )}
    </Wrapper>
  );
}
