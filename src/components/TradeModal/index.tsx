import { darken } from 'polished';
import React, { useCallback, useContext, useState } from 'react';
import { X } from 'react-feather';
import Modal from 'react-modal';
import styled, { ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useMarketContract, useTokenContract } from '../../hooks/contract';
import { useTokenAllowance, useTokenBalances } from '../../hooks/wallet';
import { useSelectedQuote } from '../../state/quotes/hooks';
import { useSelectedToken } from '../../state/tokens/hooks';
import { executeTrade, getTokenAddress, requestAllowance } from '../../utils';
import Loader, { LoaderWrapper } from '../Loader';

interface TradeModalProps {
  isOpen: boolean;
  isBuy: boolean;
  onRequestClose: () => void;
}

Modal.setAppElement('#root');

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  padding: 15px 0;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
`;

const StyledExit = styled(X)`
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${({ theme }) => darken(0.1, theme.colors.secondary)};
`;

const InnerContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  margin-top: 20px;
`;

const MainButton = styled.div<{ disabled: boolean }>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.secondary : theme.colors.tertiary};
  color: ${({ theme, disabled }) =>
    disabled ? theme.text.secondary : theme.text.againstRed};
  width: 100%;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding: 15px 0;
  margin: 45px 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease-in;
  &:hover {
    opacity: 0.8;
  }
`;

const WalletBalanceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 500;
  width: 100%;
  margin-top: 10px;
`;

const WalletBalanceLabel = styled.span`
  color: ${({ theme }) => theme.text.secondary};
`;

const WalletBalance = styled.span`
  color: ${({ theme }) => theme.text.primary};
`;

const SectionTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  width: 100%;
  margin-bottom: 10px;
`;

const Table = styled.table`
  border-collapse: separate !important;
  border-spacing: 0;
  border: 1px solid ${({ theme }) => darken(0.05, theme.colors.secondary)};
  background-color: transparent;
  width: 100%;
  border-bottom: none;
`;

const Tr = styled.tr`
  height: inherit;
  line-height: inherit;
`;

const Th = styled.th`
  background: ${({ theme }) => theme.colors.secondary};
  font-size: 13px;
  padding: 10px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.secondary};
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
  border-right: 1px solid ${({ theme }) => darken(0.05, theme.colors.secondary)};
`;

const TdInput = styled.td`
  text-align: right;
  border-right: 1px solid ${({ theme }) => darken(0.05, theme.colors.secondary)};
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
`;

const TdLabel = styled.td`
  text-transform: uppercase;
  font-size: 10px;
  text-align: center;
  font-weight: 500;
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
`;

const Input = styled.input`
  caret-color: ${({ theme }) => theme.colors.tertiary};
  border: none;
  background: none;
  outline: none;
  font-size: 15px;
  text-align: right;
  width: 100%;
  color: ${({ theme }) => theme.text.primary};
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

function useWalletBalance(isBuySelected: boolean): [string, number] {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;
  const [balances, _] = useTokenBalances();

  return isBuySelected
    ? [quote.ticker, balances[quote.ticker] || 0]
    : [token.ticker, balances[token.ticker] || 0];
}

function useModalStyle(): Modal.Styles {
  const theme = useContext(ThemeContext);

  return {
    content: {
      maxHeight: '95%',
      overflowY: 'auto',
      width: '24.5rem',
      top: '50%',
      bottom: 'none',
      left: '50%',
      padding: '0',
      transform: 'translate(-50%, -50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
    },
    overlay: {
      zIndex: 5,
      backgroundColor: theme.colors.modalBackground,
    },
  };
}

function useButtonEnabled(
  walletBalance: number,
  input: string,
  allowance: number,
) {
  if (walletBalance === 0) {
    return false;
  }

  if (allowance === 0) {
    return true;
  }

  if (isNaN(Number(input))) {
    return false;
  }

  if (Number(input) === 0) {
    return false;
  }
  return walletBalance >= Number(input);
}

function useButtonText(
  isBuy: boolean,
  walletBalance: number,
  allowance: number,
) {
  if (walletBalance === 0) {
    return isBuy ? 'No funds available' : 'No supply available';
  }

  if (allowance === 0) {
    return 'Enable';
  }

  return isBuy ? 'Buy' : 'Sell';
}

export default function (props: TradeModalProps) {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;

  const { chainId } = useActiveWeb3React();

  const tokenAddress = getTokenAddress(token, chainId!)!;
  const quoteAddress = getTokenAddress(quote, chainId!)!;

  const [allowance, isAllowanceLoading] = useTokenAllowance(
    props.isBuy ? quoteAddress : tokenAddress,
  );
  const tokenContract = useTokenContract(
    props.isBuy ? quoteAddress : tokenAddress,
  )!;

  const [priceInput, setPriceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [totalInput, setTotalInput] = useState('');

  const [walletTicker, walletBalance] = useWalletBalance(props.isBuy);

  const priceLabel = props.isBuy ? token?.ticker : quote?.ticker;
  const quantityLabel = props.isBuy ? quote?.ticker : token?.ticker;

  const modalStyle = useModalStyle();

  const buttonEnabled = useButtonEnabled(
    walletBalance,
    quantityInput,
    allowance,
  );
  const buttonText = useButtonText(props.isBuy, walletBalance, allowance);
  const marketContract = useMarketContract()!;

  const executeClick = useCallback(async () => {
    if (!buttonEnabled) {
      return;
    }

    if (allowance === 0) {
      return requestAllowance(tokenContract, chainId!);
    }

    const payAmount = quantityInput;
    const buyAmount = totalInput;
    const payAddress = props.isBuy ? quoteAddress : tokenAddress;
    const buyAddress = props.isBuy ? tokenAddress : quoteAddress;

    // TODO: execute the trade here :D
    executeTrade(marketContract, payAmount, payAddress, buyAmount, buyAddress);
    props.onRequestClose();
  }, [
    allowance,
    buttonEnabled,
    marketContract,
    totalInput,
    quantityInput,
    props.isBuy,
    tokenAddress,
    quoteAddress,
  ]);

  function updateValues(value: string, type: number) {
    if (type === 1) {
      setPriceInput(value);
      if (quantityInput)
        setTotalInput(`${Number(value) * Number(quantityInput)}`);
      else if (totalInput)
        setQuantityInput(`${Number(totalInput) / Number(value)}`);
    } else if (type === 2) {
      setQuantityInput(value);
      if (priceInput) setTotalInput(`${Number(value) * Number(priceInput)}`);
      else if (totalInput)
        setPriceInput(`${Number(totalInput) / Number(value)}`);
    } else if (type === 3) {
      setTotalInput(value);
      if (priceInput) setQuantityInput(`${Number(value) / Number(priceInput)}`);
      else if (quantityInput)
        setPriceInput(`${Number(value) / Number(quantityInput)}`);
    }
  }

  return (
    <Modal
      isOpen={props.isOpen}
      style={modalStyle}
      onRequestClose={props.onRequestClose}
    >
      <Header>
        {token.name}
        <StyledExit onClick={props.onRequestClose} size={30} />
      </Header>
      {isAllowanceLoading ? (
        <InnerContentWrapper>
          <LoaderWrapper>
            <Loader size="50px" />
          </LoaderWrapper>
        </InnerContentWrapper>
      ) : (
        <InnerContentWrapper>
          <SectionTitle>{props.isBuy ? 'Buy' : 'Sell'} Offer</SectionTitle>
          <Table>
            <tbody>
              <Tr>
                <Th>Price</Th>
                <TdInput>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={priceInput}
                    onChange={(e) => updateValues(e.target.value, 1)}
                  />
                </TdInput>
                <TdLabel>{priceLabel}</TdLabel>
              </Tr>
              <Tr>
                <Th>Quantity</Th>
                <TdInput>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={quantityInput}
                    onChange={(e) => updateValues(e.target.value, 2)}
                  />
                </TdInput>
                <TdLabel>{quantityLabel}</TdLabel>
              </Tr>
              <Tr>
                <Th>Total</Th>
                <TdInput>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={totalInput}
                    onChange={(e) => updateValues(e.target.value, 3)}
                  />
                </TdInput>
                <TdLabel>{priceLabel}</TdLabel>
              </Tr>
            </tbody>
          </Table>
          <MainButton disabled={!buttonEnabled} onClick={executeClick}>
            {buttonText}
          </MainButton>
          <WalletBalanceWrapper>
            <WalletBalanceLabel>Wallet Balance</WalletBalanceLabel>
            <WalletBalance>
              {walletBalance.toFixed(4)} {walletTicker}
            </WalletBalance>
          </WalletBalanceWrapper>
        </InnerContentWrapper>
      )}
    </Modal>
  );
}
