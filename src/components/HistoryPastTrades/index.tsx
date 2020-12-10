import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
`;


//TODO: Receive all data of past Trades
// This could be a web3 call parsing through LogTakes[2] = seller and
// LogTakes[6] = Buyer and the trade data is there....
//  This lends me to think that the user should incur web3 calls to check their
//  price history... TODO: Need to throw a loading while loading in the history
//TODO: Display that data into the scrolling chart depicted in mockup

//data passed into component should be token, BUY/Sell, Size, Tx hash

export default function () {
  return (
    <Wrapper>
      Past Trades
    </Wrapper>
  );
}
