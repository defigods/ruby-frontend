import React, { useContext } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import styled, { ThemeContext } from 'styled-components';
import { AppDispatch } from '../../state';
import { toggleDarkMode } from '../../state/user/actions';
import { useDarkMode } from '../../state/user/hooks';
import Toggle from '../Toggle';

interface UserSettingsProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const GroupLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  font-weight: 400;
  margin-right: 20px;
  color: ${({ theme }) => theme.text.secondary};
`;

export default function (props: UserSettingsProps) {
  const theme = useContext(ThemeContext);
  const darkMode = useDarkMode();
  const dispatch = useDispatch<AppDispatch>();

  const modalStyle: Modal.Styles = {
    content: {
      overflowY: 'auto',
      left: '10px',
      bottom: '68px',
      top: 'none',
      right: 'none',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.secondary,
    },
    overlay: {
      zIndex: 2,
      background: 'none',
    },
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
      style={modalStyle}
    >
      <GroupLabel>Interface Settings</GroupLabel>
      <ToggleWrapper>
        <ToggleLabel>Toggle Dark Mode</ToggleLabel>
        <Toggle isActive={darkMode} toggle={() => dispatch(toggleDarkMode())} />
      </ToggleWrapper>
    </Modal>
  );
}
