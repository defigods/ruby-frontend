import { darken } from 'polished';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { X } from 'react-feather';
import Modal from 'react-modal';
import styled, { css, ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useBestOffers, useMarketContract } from '../../hooks/contract';
import { useTokenBalances } from '../../hooks/wallet';
import { useSelectedQuote } from '../../state/quotes/hooks';
import { useSelectedToken } from '../../state/tokens/hooks';
import {
  executeLimitTrade,
  formatBN,
  getTokenAddress,
  executeMatchTrade,
  unsafeMath,
} from '../../utils';
import Loader, { LoaderWrapper } from '../Loader';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import { ApprovalState, useApproveCallback } from '../../hooks/approval';
import { useTransactionAdder } from '../../state/transactions/hooks';
import TransactionModal from './TransactionModal';

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
  border-collapse: collapse;
  // background-color: transparent;
  width: 100%;
`;

const Tr = styled.tr`
  height: inherit;
  line-height: inherit;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.text.secondary};
  }
`;

const Th = styled.th`
  font-size: 14px;
  padding: 15px 0;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.secondary};
  }
`;

const TdInput = styled.td`
  text-align: right;
  font-size: 16px;
`;

const TdLabel = styled.td`
  text-transform: uppercase;
  font-size: 16px;
  text-align: left;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const Input = styled.input`
  caret-color: ${({ theme }) => theme.colors.tertiary};
  border: none;
  background: none;
  outline: none;
  font-size: 16px;
  text-align: right;
  font-weight: 500;
  width: 100%;
  padding-right: 5px;
  color: ${({ theme }) => theme.text.primary};
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const PriceInput = styled(Input)<{ isMarket: boolean; isBuy: boolean }>`
  color: ${({ theme, isMarket, isBuy }) =>
    isMarket
      ? isBuy
        ? theme.text.green
        : theme.text.red
      : theme.text.primary};
`;

const TabGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const TabGroupSelector = styled.div<{ selected: boolean }>`
  font-size: 11px;
  text-transform: uppercase;
  overflow: none;
  padding: 8px 0;
  cursor: pointer;
  width: 50%;
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
  color: ${({ selected, theme }) =>
    selected ? theme.text.tertiary : theme.text.secondary};
`;

const TabGroupLine = styled.div<{ isMarket: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-radius: 3px;
  ${({ isMarket }) =>
    isMarket
      ? css`
          right: 50%;
        `
      : css`
          left: 50%;
        `}
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

export default function ({ isBuy, isOpen, onRequestClose }: TradeModalProps) {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;

  const { chainId } = useActiveWeb3React();

  const tokenAddress = getTokenAddress(token, chainId!)!;
  const quoteAddress = getTokenAddress(quote, chainId!)!;

  const addTransaction = useTransactionAdder();
  const [approvalState, approve] = useApproveCallback(
    isBuy ? quoteAddress : tokenAddress,
  );

  const [priceInput, setPriceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [totalInput, setTotalInput] = useState('');
  const [isMarket, setIsMarket] = useState(true);

  const [walletTicker, walletBalance] = useWalletBalance(isBuy);
  const [offers, loadingOffers] = useBestOffers();

  const currentOffer = useMemo(() => {
    if (loadingOffers) return undefined;

    return isBuy ? offers.buy : offers.sell;
  }, [isBuy, offers, loadingOffers]);

  const modalStyle = useModalStyle();

  // Transaction modal values
  const [{ attempting, hash, error }, setTransactionState] = useState<{
    attempting: boolean;
    hash: string | undefined;
    error: string | undefined;
  }>({
    attempting: false,
    hash: undefined,
    error: undefined,
  });

  const buttonEnabled = useMemo(() => {
    if (
      walletBalance.isZero() ||
      approvalState === ApprovalState.UNKNOWN ||
      approvalState === ApprovalState.PENDING
    ) {
      return false;
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return true;
    }

    const inputBN = parseUnits((isBuy ? totalInput : quantityInput) || '0');
    const quantityBN = parseUnits(quantityInput || '0');

    const marketRequirement =
      isMarket && currentOffer ? quantityBN.lte(currentOffer.baseAmount) : true;

    if (inputBN.isZero()) {
      return false;
    }
    return walletBalance.gte(inputBN) && marketRequirement;
  }, [
    walletBalance,
    approvalState,
    isBuy,
    totalInput,
    quantityInput,
    currentOffer,
    isMarket,
  ]);
  const buttonText = useMemo(() => {
    if (walletBalance.isZero()) {
      return isBuy ? 'No funds available' : 'No supply available';
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return 'Approve';
    }

    if (approvalState === ApprovalState.PENDING) {
      return (
        <>
          <span style={{ marginRight: '5px' }}>Approving</span>
          <Loader stroke="white" size="15px" />
        </>
      );
    }

    return isBuy ? 'Buy' : 'Sell';
  }, [walletBalance, isBuy, approvalState]);
  const marketContract = useMarketContract()!;

  useEffect(() => {
    if (isMarket && currentOffer && !priceInput) {
      setPriceInput(
        `${currentOffer.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      );
      const total =
        Number(formatEther(currentOffer.baseAmount)) * currentOffer.price;
      setQuantityInput(formatEther(currentOffer.baseAmount));
      setTotalInput(`${total}`);
    }
  }, [currentOffer, isMarket, priceInput]);

  const updateIsMarket = () => {
    setPriceInput('');
    setQuantityInput('');
    setTotalInput('');
    setIsMarket(!isMarket);
  };

  const executeClick = useCallback(async () => {
    if (!buttonEnabled) {
      return;
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return approve();
    }

    let trade: Promise<TransactionResponse>;
    if (isMarket) {
      if (!currentOffer) return;

      const toBuy = parseUnits(quantityInput || '0');
      if (toBuy.isZero()) return;
      const maxAmount = isBuy
        ? unsafeMath(toBuy, currentOffer.price, (n1, n2) => n1 / n2)
        : unsafeMath(toBuy, currentOffer.price, (n1, n2) => n1 * n2);

      trade = executeMatchTrade(marketContract, currentOffer, maxAmount);
    } else {
      const payAmount = isBuy ? totalInput : quantityInput;
      const buyAmount = isBuy ? quantityInput : totalInput;
      const payAddress = isBuy ? quoteAddress : tokenAddress;
      const buyAddress = isBuy ? tokenAddress : quoteAddress;

      trade = executeLimitTrade(
        marketContract,
        payAmount,
        payAddress,
        buyAmount,
        buyAddress,
      );
    }

    try {
      setTransactionState({ attempting: true, hash, error });
      const result = await trade;
      addTransaction(result);
      setTransactionState({ attempting: false, hash: result.hash, error });
    } catch (e) {
      const msg =
        e.code === 4001
          ? 'User rejected transaction.'
          : `Trade failed: ${e.message}`;
      setTransactionState({ attempting: false, hash, error: msg });
    }

    // onRequestClose();
  }, [
    approve,
    buttonEnabled,
    marketContract,
    totalInput,
    quantityInput,
    isBuy,
    tokenAddress,
    quoteAddress,
    onRequestClose,
    isMarket,
    currentOffer,
    approvalState,
    addTransaction,
  ]);

  function updateValues(value: string, type: number) {
    if (!isMarket && type === 1) {
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
    <Modal isOpen={isOpen} style={modalStyle} onRequestClose={onRequestClose}>
      <Header>
        {token.name}
        <StyledExit onClick={onRequestClose} size={30} />
      </Header>
      <TabGroupWrapper>
        <TabGroupSelector selected={isMarket} onClick={updateIsMarket}>
          Market
        </TabGroupSelector>
        <TabGroupSelector selected={!isMarket} onClick={updateIsMarket}>
          Limit
        </TabGroupSelector>
        <TabGroupLine isMarket={isMarket} />
      </TabGroupWrapper>
      {approvalState === ApprovalState.UNKNOWN || loadingOffers ? (
        <InnerContentWrapper>
          <LoaderWrapper>
            <Loader size="50px" />
          </LoaderWrapper>
        </InnerContentWrapper>
      ) : (
        <InnerContentWrapper>
          <SectionTitle>{isBuy ? 'Buy' : 'Sell'} Offer</SectionTitle>
          <Table>
            <tbody>
              <Tr>
                <Th>Price</Th>
                <TdInput>
                  <PriceInput
                    type="number"
                    placeholder="0.0"
                    value={priceInput}
                    onChange={(e) => updateValues(e.target.value, 1)}
                    disabled={isMarket}
                    isMarket={isMarket}
                    isBuy={isBuy}
                  />
                </TdInput>
                <TdLabel>{'USD'}</TdLabel>
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
                <TdLabel>{token?.ticker}</TdLabel>
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
                <TdLabel>{'USD'}</TdLabel>
              </Tr>
            </tbody>
          </Table>
          <MainButton disabled={!buttonEnabled} onClick={executeClick}>
            {buttonText}
          </MainButton>
          <WalletBalanceWrapper>
            <WalletBalanceLabel>Wallet Balance</WalletBalanceLabel>
            <WalletBalance>
              {formatBN(walletBalance)} {walletTicker}
            </WalletBalance>
          </WalletBalanceWrapper>
          <TransactionModal
            onRequestClose={() =>
              setTransactionState({
                attempting: false,
                hash: undefined,
                error: undefined,
              })
            }
            attempting={attempting}
            hash={hash}
            error={error}
          />
        </InnerContentWrapper>
      )}
    </Modal>
  );
}
