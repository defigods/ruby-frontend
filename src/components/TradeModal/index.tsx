import React, { useContext } from 'react';
import Modal from 'react-modal';
import { ThemeContext } from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';

interface TradeModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

Modal.setAppElement('#root');

export default function (props: TradeModalProps) {
  const theme = useContext(ThemeContext);

  const token = useSelectedToken();

  const modalStyle: Modal.Styles = {
    content: {
      maxHeight: '95%',
      margin: '0 1.33rem',
      overflowY: 'auto',
      width: '25.5rem',
      //   top: '50%',
      left: '50%',
      //   right: 'auto',
      //   bottom: 'auto',
      //   marginRight: '-50%',
      transform: 'translateX(-50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
    },
    overlay: {
      zIndex: 5,
      backgroundColor: theme.colors.modalBackground,
    },
  };

  return (
    <Modal
      isOpen={props.isOpen}
      style={modalStyle}
      onRequestClose={props.onRequestClose}
    >
      <p>hi</p>
    </Modal>
  );
}
