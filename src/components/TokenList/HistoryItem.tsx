import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { AppDispatch } from '../../state';
import { selectToken } from '../../state/tokens/actions';
import { useSelectedToken } from '../../state/tokens/hooks';
import { useHistory } from 'react-router-dom';

const Wrapper = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  cursor: pointer;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.secondary : 'auto'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  transition: all 0.1s ease-in;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ItemWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-child {
    justify-content: flex-start;
    & > {
      margin-right: auto;
    }

    img {
      padding-right: 8px;
    }
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 4px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const Subtitle = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
`;

export default function () {
  const dispatch = useDispatch<AppDispatch>();
  // Get the last day of data

  const selectedToken = useSelectedToken();

  const history = useHistory();

  return (
    <Wrapper
      selected={'TOTAL' === selectedToken?.ticker}
      onClick={() => dispatch(selectToken('TOTAL'))}
    >
      <ItemWrapper>
        <TextWrapper>
          <Title>Total History</Title>
          <Subtitle>All token trading histories</Subtitle>
        </TextWrapper>
      </ItemWrapper>
    </Wrapper>
  );
}
