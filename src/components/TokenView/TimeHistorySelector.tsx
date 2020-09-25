import React from 'react';
import styled from 'styled-components';
import { TimeHistory } from '../../types';

interface TimeHistorySelectorProps {
  selectedTime: TimeHistory;
  onSelect: (timeHistory: TimeHistory) => void;
}

const SELECTED_CLASS = 'selected';

const OneMoreWrapper = styled.div`
  padding: 20px;
  padding-top: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  margin: 0 20px;
`;

const Wrapper = styled.div`
  width: calc(100% - 80px);
  display: flex;
  margin: 0 40px;
  flex-direction: row;
  justify-content: space-between;
`;

const Item = styled.span`
  color: ${({ theme }) => theme.text.tertiary};
  text-transform: uppercase;
  font-size: 12px;
  transition: all 0.2s ease-in;
  cursor: pointer;
  padding: 10px 0;
  font-weight: 500;
  margin: 0 10px;

  &:hover {
    opacity: 0.5s;
  }

  &.${SELECTED_CLASS} {
    opacity: 0.5;
    border-bottom: 1px solid ${({ theme }) => theme.colors.tertiary};
  }
`;

function getTimeHistoryDisplays(): string[] {
  return Object.values(TimeHistory);
}

export default function (props: TimeHistorySelectorProps) {
  return (
    <OneMoreWrapper>
      <Wrapper>
        {getTimeHistoryDisplays().map((item) => (
          <Item
            key={item}
            className={props.selectedTime === item ? SELECTED_CLASS : ''}
            onClick={() => props.onSelect(item as TimeHistory)}
          >
            {item.split('|')[0]}
          </Item>
        ))}
      </Wrapper>
    </OneMoreWrapper>
  );
}
