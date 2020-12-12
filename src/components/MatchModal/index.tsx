import { BigNumber } from '@ethersproject/bignumber';
import { formatEther, parseUnits } from 'ethers/lib/utils';
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
import {
  executeMatch,
  formatBN,
  getTokenAddress,
  requestAllowance,
} from '../../utils';
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

function useWalletBalance(isBuySelected: boolean): [string, BigNumber] {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;
  const [balances] = useTokenBalances();

  return isBuySelected
    ? ['USD', balances[quote.ticker] || BigNumber.from(0)]
    : [token.ticker, balances[token.ticker] || BigNumber.from(0)];
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
  walletBalance: BigNumber,
  input: string,
  allowance: BigNumber,
  maxAmount: BigNumber,
) {
  if (walletBalance.isZero()) {
    return false;
  }

  if (allowance.isZero()) {
    return true;
  }

  const inputBN = parseUnits(input || '0');

  if (inputBN.isZero()) {
    return false;
  }

  return walletBalance.gte(inputBN) && maxAmount.gte(inputBN);
}

function useButtonText(
  isBuy: boolean,
  walletBalance: BigNumber,
  allowance: BigNumber,
) {
  if (walletBalance.isZero()) {
    return isBuy ? 'No funds available' : 'No supply available';
  }

  if (allowance.isZero()) {
    return 'Enable';
  }

  return isBuy ? 'Buy' : 'Sell';
}

function unsafeMath(
  bn: BigNumber,
  n: number,
  fn: (n1: number, n2: number) => number,
): BigNumber {
  const parsed = Number(formatEther(bn));
  return parseUnits(`${fn(parsed, n).toFixed(18)}`);
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

  const amount = parseUnits(input || '0');
  const quantity = buttonEnabled
    ? isBuy
      ? unsafeMath(amount, offer.price, (n1, n2) => n1 / n2)
      : unsafeMath(amount, offer.price, (n1, n2) => n1 * n2)
    : isBuy
    ? offer.baseAmount
    : offer.quoteAmount;
  const total = buttonEnabled
    ? amount
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
          {formatBN(quantity)} {isBuy ? token.ticker : 'USD'}
        </span>
      </SectionItem>
      <Line />
      <SectionItem>
        <span>Total</span>
        <span>
          {formatBN(total)} {isBuy ? 'USD' : token.ticker}
        </span>
      </SectionItem>
    </>
  );
}

export default function ({ isOpen, onRequestClose }: TradeModalProps) {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;

  const { chainId } = useActiveWeb3React();

  const tokenAddress = getTokenAddress(token, chainId!)!;
  const quoteAddress = getTokenAddress(quote, chainId!)!;

  const [isBuySelected, toggleBuySelected] = useState(true);
  const [input, setInput] = useState('');

  const [allowance] = useTokenAllowance(
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
          : currentOffer?.baseAmount) || BigNumber.from(0),
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
    const offerValue = isBuySelected
      ? currentOffer.quoteAmount
      : currentOffer.baseAmount;
    if (offerValue.lt(walletBalance)) {
      setInput(formatEther(offerValue));
    } else {
      setInput(formatEther(walletBalance));
    }
  }, [currentOffer, walletBalance, setInput, isBuySelected]);

  const executeClick = useCallback(async () => {
    if (!buttonEnabled || !currentOffer) {
      return;
    }

    if (allowance.isZero()) {
      return requestAllowance(tokenContract, chainId!);
    }

    const toBuy = parseUnits(input || '0');
    if (toBuy.isZero()) return;
    const maxAmount = isBuySelected
      ? unsafeMath(toBuy, currentOffer.price, (n1, n2) => n1 / n2)
      : unsafeMath(toBuy, currentOffer.price, (n1, n2) => n1 * n2);

    // TODO: execute the trade here :D
    executeMatch(marketContract, currentOffer, maxAmount);
    onRequestClose();
  }, [
    allowance,
    buttonEnabled,
    marketContract,
    currentOffer,
    input,
    chainId,
    isBuySelected,
    onRequestClose,
    tokenContract,
  ]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    try {
      parseUnits(value);
      setInput(value);
    } catch (ex) {
      // ignore the exception, don't update input
    }
  };

  return (
    <Modal isOpen={isOpen} style={modalStyle} onRequestClose={onRequestClose}>
      <Header>
        {token.name}
        <StyledExit onClick={onRequestClose} size={30} />
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
              onChange={(e) => handleInputChange(e)}
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
                  {formatBN(walletBalance)} {walletTicker}
                </WalletBalance>
              </WalletBalanceWrapper>
            </InnerContentWrapper>
          )}
        </>
      )}
    </Modal>
  );
}
