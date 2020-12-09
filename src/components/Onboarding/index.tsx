import { darken } from 'polished';
import React, { useCallback, useContext, useState } from 'react';
import { X } from 'react-feather';
import Modal from 'react-modal';
import styled, { ThemeContext } from 'styled-components';
import { useActiveWeb3React, useEagerConnect } from '../../hooks';
import { useMarketContract, useTokenContract } from '../../hooks/contract';
import { useTokenAllowance, useTokenBalances } from '../../hooks/wallet';
import { useSelectedQuote } from '../../state/quotes/hooks';
import { useSelectedToken } from '../../state/tokens/hooks';
import {
  executeTrade,
  formatBN,
  getTokenAddress,
  requestAllowance,
} from '../../utils';
import Loader, { LoaderWrapper } from '../Loader';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from 'ethers/lib/utils';
import logo from '../../assets/img/logo-color.png';
import mmLogo from '../../assets/img/metamask.svg';
import { injected } from '../../connectors';

Modal.setAppElement('#root');

const MainButton = styled.div<{ disabled: boolean }>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.secondary : theme.colors.tertiary};
  color: ${({ theme, disabled }) =>
    disabled ? theme.text.secondary : theme.text.againstRed};
  width: 80%;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding: 15px 0;
  margin: auto;
  margin-bottom: 15px;
  margin-top: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease-in;
  &:hover {
    opacity: 0.8;
  }
`;

const LogoWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 30px 50px 30px 50px;
  display: flex;
  justify-content: center;
`;

const TextWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 8px 20px 8px 20px;
  text-align: center;
  justify-content: center;
`;

const WalletOptionWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 20px 50px 20px 50px;
  display: flex;
  justify-content: center;
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
`;

const MM = styled.img`
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
`;

function useModalStyle(): Modal.Styles {
  const theme = useContext(ThemeContext);

  // const executeClick = useCallback(async () => {
  //   if (!buttonEnabled) {
  //     return;
  //   }
  //
  // }, 'test');

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

export default function () {
  const modalStyle = useModalStyle();
  const buttonEnabled = true;
  const hasWallet = true;
  const { active, activate } = useActiveWeb3React();

  function connectToApp() {
    // LOGIC to connect to wallet
    // User should see the modal overlaying the main app
    activate(injected, undefined, true).catch((err) => {
      console.error(`Failed to activate account`, err);
    });
    console.log('Connect Clicked');
  }

  return (
    <>
      {hasWallet ? (
        // Already has Web3 wallet
        <Modal isOpen={true} style={modalStyle}>
          <LogoWrapper>
            <Logo src={logo} alt="logo" />
          </LogoWrapper>
          <TextWrapper>
            <h2>Welcome to Rubicon</h2>
            <p>Please connect your browser wallet to begin trading.</p>
          </TextWrapper>
          <MainButton disabled={!buttonEnabled} onClick={connectToApp}>
            CONNECT
          </MainButton>
        </Modal>
      ) : (
        <Modal isOpen={true} style={modalStyle}>
          <LogoWrapper>
            <Logo src={logo} alt="logo" />
          </LogoWrapper>
          <TextWrapper>
            <h2>Welcome to Rubicon</h2>
            <p>
              To trade on Rubicon and connect to the Ethereum blockchain, please
              install a browser wallet.
            </p>
            <WalletOptionWrapper>
              <a href={'https://metamask.io/'}>
                <MM src={mmLogo} alt="Metamask" />
              </a>
            </WalletOptionWrapper>
          </TextWrapper>
        </Modal>
      )}
    </>
  );
}
