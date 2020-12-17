import React from 'react';
import { ExternalLink } from 'react-feather';
import styled from 'styled-components';
import { UserTrade } from '../../types';
import moment from 'moment';
import { useActiveWeb3React } from '../../hooks';
import { getEtherscanLink } from '../../utils';

interface PastTradeItemProps {
  data: UserTrade;
}

const Wrapper = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 10px 0 10px 0;
  margin: 10px 0 10px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const TextItem = styled.div`
  width: 20%;
  text-align: center;
  color: ${({ theme }) => theme.text.primary};
`;

const Link = styled(ExternalLink)`
  color: ${({ theme }) => theme.text.primary};
`;

const SizeText = styled(TextItem)<{ isBuy: boolean }>`
  color: ${({ isBuy, theme }) => (isBuy ? theme.text.green : theme.text.red)};
`;

export default function ({ data }: PastTradeItemProps) {
  const { chainId } = useActiveWeb3React();
  return (
    <Wrapper>
      <TextItem style={{ fontWeight: 500 }}>
        {data.isBuy ? data.buyGem : data.payGem}
      </TextItem>
      <TextItem>{data.isBuy ? 'BUY' : 'SELL'}</TextItem>
      <SizeText isBuy={data.isBuy}>
        {data.isBuy
          ? `+${data.buyAmount.toFixed(2)}`
          : `-${data.payAmount.toFixed(2)}`}
      </SizeText>
      <TextItem>{moment.unix(data.timestamp).fromNow()}</TextItem>
      <TextItem>
        <a
          href={getEtherscanLink(chainId!, data.transactionHash, 'transaction')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Link />
        </a>
      </TextItem>
    </Wrapper>
  );
}
