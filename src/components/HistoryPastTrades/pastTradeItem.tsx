import React from 'react';
import styled from 'styled-components';
import externalLinkBlack from '../../assets/img/external-link-black.png';
import { UserTrade } from '../../types';

interface pastTradeItemProps {
  data: UserTrade;
}

const Wrapper = styled.div`
  height: 50px;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.tertiary};
  border-radius: 5px;
  padding: 10px 0 10px 0;
  margin: 10px 0 10px 0;
  display: inline-flex;
`;

const TextItem = styled.div`
  padding: 0px 130px 0px 130px;
`;

const TextItemStart = styled.div`
  padding: 0px 110px 0px 40px;
`;

const Etherscan = styled.img`
  height: 40px;
  // width: 40px;
  padding: 0px 0px 0px 100px;
`;

const TextItemEnd = styled.div`
  padding: 0px 40px 0px 50px;
`;

export default function (props: pastTradeItemProps) {
  const data = props.data;
  console.log(data);

  const isBuy = data['isBuy'];
  console.log('isBuy?', data['isBuy']);

  return (
    <Wrapper>
      {isBuy ? (
        <>
          <TextItemStart>{data['buyGem']}</TextItemStart>
          <TextItem>BUY</TextItem>
          <TextItem>+{data['buyAmount'].toFixed(2)}</TextItem>
          <a href={'https://etherscan.io/tx/' + data['transactionHash']}>
            <Etherscan src={externalLinkBlack}></Etherscan>
          </a>
        </>
      ) : (
        <>
          <TextItemStart>{data['payGem']}</TextItemStart>
          <TextItem>SELL</TextItem>
          <TextItem>-{data['payAmount'].toFixed(2)}</TextItem>
          <a href={'https://etherscan.io/tx/' + data['transactionHash']}>
            <Etherscan src={externalLinkBlack}></Etherscan>
          </a>
        </>
      )}
    </Wrapper>
  );
}
