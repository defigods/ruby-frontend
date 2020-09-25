import React from 'react';
import styled from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';
import { TimeHistory, Token } from '../../types';
import { getSortedPrices } from '../../utils';
import LineChart from './LineChart';

interface TokenListItemProps extends Token {
  /**
   * Title of the item
   */
  title: string;
  /**
   * Subtitle of the item
   */
  subtitle: string;
}

const Wrapper = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px 25px;
  cursor: pointer;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.secondary : 'auto'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const ItemWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  &:first-child {
    justify-content: flex-start;
    & > {
      margin-right: auto;
    }
  }
  &:last-child {
    justify-content: flex-end;
    & > {
      margin-left: auto;
    }
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const Subtitle = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
`;

const PriceWrapper = styled.span<{ upwardsTrend?: boolean }>`
  color: ${(props) =>
    props.upwardsTrend ? props.theme.text.green : props.theme.text.red};
  font-size: 14px;
`;

export default function (props: TokenListItemProps) {
  // Get the last day of data
  const prices = getSortedPrices(props.prices[TimeHistory.ONE_DAY]!); // should always be loaded;
  let upwardsTrend = false;
  if (prices.length === 0 || prices[0] < prices[prices.length - 1]) {
    upwardsTrend = true;
  }

  const selectedToken = useSelectedToken();

  return (
    <Wrapper selected={props.ticker === selectedToken?.ticker}>
      <ItemWrapper>
        <TextWrapper>
          <Title>{props.title}</Title>
          <Subtitle>{props.subtitle}</Subtitle>
        </TextWrapper>
      </ItemWrapper>
      <ItemWrapper>
        <LineChart data={prices} />
      </ItemWrapper>
      <ItemWrapper>
        <PriceWrapper upwardsTrend={upwardsTrend}>
          ${props.currentPrice.toFixed(4)}
        </PriceWrapper>
      </ItemWrapper>
    </Wrapper>
  );
}
