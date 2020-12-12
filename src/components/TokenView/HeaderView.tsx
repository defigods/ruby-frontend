import React, { useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import styled from 'styled-components';
import {
  useSelectedTimeHistory,
  useSelectedToken,
} from '../../state/tokens/hooks';
import { getPercentChange, usePrevious } from '../../utils';

interface HeaderViewProps {
  timestamp?: number;
}

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

export default function ({ timestamp }: HeaderViewProps) {
  const selectedToken = useSelectedToken()!; // will always be defined here
  const selectedTimeHistory = useSelectedTimeHistory();

  // TODO: create a loading thing if the prices r being loaded

  const [absoluteDifference, percentChange] = useMemo(() => {
    return getPercentChange(selectedToken, timestamp, selectedTimeHistory);
  }, [selectedToken, timestamp, selectedTimeHistory]);

  const [displayPrice, setDisplayPrice] = useState(0);
  const prevDisplayPrice = usePrevious(displayPrice);

  useEffect(() => {
    setDisplayPrice(
      timestamp
        ? selectedToken.prices[selectedTimeHistory]![timestamp]
        : selectedToken.currentPrice,
    );
  }, [selectedToken, timestamp, selectedTimeHistory]);

  return (
    <Wrapper>
      <ChildWrapper>
        <StyledCountUp
          end={displayPrice}
          start={prevDisplayPrice}
          prefix="$"
          separator=","
          decimals={4}
        />
        <SubtitleWrapper>
          <DifferenceWrapper upwardsTrend={absoluteDifference > 0}>
            {absoluteDifference > 0 ? '+' : ''}
            {absoluteDifference.toFixed(2)} ({(percentChange * 100).toFixed(2)}
            %)
          </DifferenceWrapper>{' '}
          {!timestamp && 'TODAY'}
        </SubtitleWrapper>
      </ChildWrapper>
      <ChildWrapper>
        <TitleWrapper>{selectedToken.ticker}</TitleWrapper>
        <SubtitleWrapper>{selectedToken.name} | Equity Token</SubtitleWrapper>
      </ChildWrapper>
    </Wrapper>
  );
}
