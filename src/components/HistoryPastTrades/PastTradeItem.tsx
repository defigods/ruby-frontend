import React, { useCallback } from 'react';
import { ExternalLink, X } from 'react-feather';
import styled from 'styled-components';
import { UserTrade } from '../../types';
import moment from 'moment';
import { useActiveWeb3React } from '../../hooks';
import { cancelTrade, getEtherscanLink } from '../../utils';
import { useMarketContract } from '../../hooks/contract';

interface PastTradeItemProps {
  trade: UserTrade;
  key: any;
}

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 10px 0 10px 0;
  margin: 10px 0 10px 0;
`;

const Row = styled.div<{ killed: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  opacity: ${({ killed }) => (killed ? '20%' : '100%')};
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

const StyledX = styled(X)`
  position: absolute;
  top: 50%;
  left: 3px;
  cursor: pointer;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.tertiary};
`;

export default function ({ trade }: any) {
  const { chainId } = useActiveWeb3React();

  const contract = useMarketContract()!;

  const cancelTradeCallback = useCallback(
    async (id) => {
      return await cancelTrade(contract, id);
    },
    [contract],
  );

  return (
    <Wrapper>
      {[trade, ...trade.siblings].map((data, idx) => (
        <Row killed={data.killed} key={data.id}>
          {!data.completed && !data.killed && (
            <StyledX onClick={() => cancelTradeCallback(data.id)} />
          )}
          <TextItem style={{ fontWeight: 500 }}>
            {idx > 0 ? '' : data.isBuy ? data.buyGem : data.payGem}
          </TextItem>
          <TextItem>{idx > 0 ? '' : data.isBuy ? 'BUY' : 'SELL'}</TextItem>
          <SizeText isBuy={data.isBuy}>
            {data.isBuy
              ? `+${data.buyAmount.toFixed(2)}`
              : `-${data.payAmount.toFixed(2)}`}
          </SizeText>
          <TextItem>
            {idx > 0 ? '' : moment.unix(data.timestamp).fromNow()}
          </TextItem>
          <TextItem>
            {idx > 0 ? (
              ''
            ) : (
              <a
                href={getEtherscanLink(
                  chainId!,
                  data.transactionHash,
                  'transaction',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link />
              </a>
            )}
          </TextItem>
        </Row>
      ))}
    </Wrapper>
  );
}
