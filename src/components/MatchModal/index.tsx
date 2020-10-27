import { min } from 'moment';
import { darken } from 'polished';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { X } from 'react-feather';
import Modal from 'react-modal';
import styled, { css, ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import {
  useBestOffers,
  useMarketContract,
  useTokenContract,
} from '../../hooks/contract';
import { useTokenAllowance, useTokenBalances } from '../../hooks/wallet';
import { useSelectedQuote } from '../../state/quotes/hooks';
import { useSelectedToken } from '../../state/tokens/hooks';
import { ContractOffer, QuoteToken, Token } from '../../types';
import { executeMatch, getTokenAddress, requestAllowance } from '../../utils';
import Loader from '../Loader';

interface TradeModalProps {
  isOpen: boolean;
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

const AmountInputWrapper = styled.div`
  position: relative;
`;

const AmountInput = styled.input`
  font-size: 2.625rem;
  caret-color: ${({ theme }) => theme.colors.tertiary};
  border: none;
  outline: none;
  padding: 2rem 4rem;
  width: 100%;
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.secondary};
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const MaxButton = styled.span`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  font-weight: 600;
  right: 15px;
  color: ${({ theme }) => theme.text.secondary};
`;

const StyledExit = styled(X)`
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${({ theme }) => darken(0.1, theme.colors.secondary)};
`;

const TabGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const TabGroupSelector = styled.div<{ selected: boolean }>`
  font-size: 12px;
  text-transform: uppercase;
  overflow: none;
  padding: 5px 0;
  cursor: pointer;
  width: 50%;
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
  color: ${({ selected, theme }) =>
    selected ? theme.text.tertiary : theme.text.secondary};
`;

const TabGroupLine = styled.div<{ isBuySelected: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-radius: 3px;
  ${({ isBuySelected }) =>
    isBuySelected
      ? css`
          right: 50%;
        `
      : css`
          left: 50%;
        `}
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
  margin: 25px 0 10px 0;
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
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  width: 100%;
`;

const SectionItem = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 15px 0;

  span:first-child {
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.text.secondary};
  }

  span:last-child {
    color: ${({ theme }) => theme.text.primary};
    font-weight: 500;
  }
`;

const Error = styled.span`
  font-size: 25px;
  color: ${({ theme }) => theme.text.tertiary};
  font-weight: 500;
  display: flex;
  width: 100%;
  text-align: center;
  padding: 40px 20px;
`;

const Line = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.text.secondary};
`;

const Price = styled.span<{ isBuy: boolean }>`
  color: ${({ isBuy, theme }) =>
    isBuy ? theme.text.green : theme.text.red} !important;
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
  maxAmount: number,
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

  return walletBalance >= Number(input) && Number(input) <= maxAmount;
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

function useCalculatedSection(
  offer: ContractOffer | undefined,
  token: Token,
  quote: QuoteToken,
  buttonEnabled: boolean,
  input: string,
  isBuy: boolean,
) {
  if (!offer) {
    return null;
  }

  const quantity = buttonEnabled
    ? isBuy
      ? Number(input) / offer.price
      : Number(input) * offer.price
    : isBuy
    ? offer.baseAmount
    : offer.quoteAmount;
  const total = buttonEnabled
    ? Number(input)
    : isBuy
    ? offer.quoteAmount
    : offer.baseAmount;

  return (
    <>
      <SectionItem>
        <span>Price</span>
        <Price isBuy={isBuy}>${offer.price.toFixed(2)}</Price>
      </SectionItem>
      <Line />
      <SectionItem>
        <span>Quantity</span>
        <span>
          {quantity.toFixed(4)} {isBuy ? token.ticker : quote.ticker}
        </span>
      </SectionItem>
      <Line />
      <SectionItem>
        <span>Total</span>
        <span>
          {total.toFixed(4)} {isBuy ? quote.ticker : token.ticker}
        </span>
      </SectionItem>
    </>
  );
}

export default function (props: TradeModalProps) {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;

  const { chainId } = useActiveWeb3React();

  const tokenAddress = getTokenAddress(token, chainId!)!;
  const quoteAddress = getTokenAddress(quote, chainId!)!;

  const [isBuySelected, toggleBuySelected] = useState(true);
  const [input, setInput] = useState('');

  const [allowance, isAllowanceLoading] = useTokenAllowance(
    isBuySelected ? quoteAddress : tokenAddress,
  );
  const tokenContract = useTokenContract(
    isBuySelected ? quoteAddress : tokenAddress,
  )!;

  const [offers, loadingOffers] = useBestOffers();
  const [walletTicker, walletBalance] = useWalletBalance(isBuySelected);

  const modalStyle = useModalStyle();

  const currentOffer = isBuySelected ? offers.buy : offers.sell;

  const buttonEnabled = useMemo(
    () =>
      useButtonEnabled(
        walletBalance,
        input,
        allowance,
        (isBuySelected
          ? currentOffer?.quoteAmount
          : currentOffer?.baseAmount) || 0,
      ),
    [isBuySelected, walletBalance, input, allowance, currentOffer],
  );
  const buttonText = useMemo(
    () => useButtonText(isBuySelected, walletBalance, allowance),
    [isBuySelected, walletBalance, allowance],
  );

  const marketContract = useMarketContract()!;

  const maxCallback = useCallback(() => {
    if (!currentOffer) return;
    return setInput(
      `${Math.min(
        isBuySelected ? currentOffer.quoteAmount : currentOffer.baseAmount,
        walletBalance,
      )}`,
    );
  }, [currentOffer, walletBalance, setInput, isBuySelected]);

  const executeClick = useCallback(async () => {
    if (!buttonEnabled || !currentOffer) {
      return;
    }

    if (allowance === 0) {
      return requestAllowance(tokenContract, chainId!);
    }

    const toBuy = Number(input);
    const maxAmount = isBuySelected
      ? toBuy / currentOffer.price
      : toBuy * currentOffer.price;

    // TODO: execute the trade here :D
    executeMatch(marketContract, currentOffer, maxAmount);
    props.onRequestClose();
  }, [allowance, buttonEnabled, marketContract, currentOffer, input]);

  const calculatedSection = useMemo(
    () =>
      useCalculatedSection(
        currentOffer,
        token,
        quote,
        buttonEnabled,
        input,
        isBuySelected,
      ),
    [currentOffer, token, quote, input, isBuySelected, buttonEnabled],
  );

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
      {loadingOffers ? (
        <Loader />
      ) : (
        <>
          <AmountInputWrapper>
            <AmountInput
              placeholder="0"
              autoComplete="off"
              autoFocus={true}
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <MaxButton onClick={maxCallback}>Max</MaxButton>
          </AmountInputWrapper>
          <TabGroupWrapper>
            <TabGroupSelector
              selected={isBuySelected}
              onClick={() => toggleBuySelected(true)}
            >
              Buy
            </TabGroupSelector>
            <TabGroupSelector
              selected={!isBuySelected}
              onClick={() => toggleBuySelected(false)}
            >
              Sell
            </TabGroupSelector>
            <TabGroupLine isBuySelected={isBuySelected} />
          </TabGroupWrapper>
          {!currentOffer ? (
            <Error>There is no trade currently available.</Error>
          ) : (
            <InnerContentWrapper>
              <SectionTitle>Best Offer</SectionTitle>

              {calculatedSection}
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
        </>
      )}
    </Modal>
  );
}