import React from 'react';
import CountUp from 'react-countup';
import styled from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';
import { TimeHistory } from '../../types';
import { getPercentChange, getSortedPrices } from '../../utils';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 20px 0px;
  margin: 0 20px;
`;

const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;

  &:last-child {
    text-align: right;
  }
`;

const DifferenceWrapper = styled.span<{ upwardsTrend?: boolean }>`
  color: ${(props) =>
    props.upwardsTrend ? props.theme.text.green : props.theme.text.red};
`;

const TitleWrapper = styled.span`
  font-size: 20px;
`;

const SubtitleWrapper = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 11px;
`;

const StyledCountUp = styled(CountUp)`
  font-size: 35px;
`;

export default function () {
  const selectedToken = useSelectedToken()!; // will always be defined here
  const prices = getSortedPrices(selectedToken.prices[TimeHistory.ONE_DAY]!); // should always be defined

  let upwardsTrend = false;
  if (prices.length === 0 || prices[0] < prices[prices.length - 1]) {
    upwardsTrend = true;
  }

  const [absoluteDifference, percentChange] = getPercentChange(selectedToken);

  return (
    <Wrapper>
      <ChildWrapper>
        <StyledCountUp
          end={selectedToken.currentPrice}
          prefix="$"
          separator=","
          decimals={4}
        />
        <SubtitleWrapper>
          <DifferenceWrapper upwardsTrend={upwardsTrend}>
            {absoluteDifference > 0 ? '+' : ''}
            {absoluteDifference.toFixed(2)} ({(percentChange * 100).toFixed(2)}
            %)
          </DifferenceWrapper>{' '}
          TODAY
        </SubtitleWrapper>
      </ChildWrapper>
      <ChildWrapper>
        <TitleWrapper>{selectedToken.ticker}</TitleWrapper>
        <SubtitleWrapper>{selectedToken.name} | Equity Token</SubtitleWrapper>
      </ChildWrapper>
    </Wrapper>
  );
}
