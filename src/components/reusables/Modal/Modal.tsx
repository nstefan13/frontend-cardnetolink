import Image from 'next/image';
import classNames from 'classnames';
import { CSSProperties, PropsWithChildren } from 'react';
import { Sheet } from 'react-modal-sheet';

import Paper from '../Paper/Paper';

import Close from 'public/svgs/close.svg';

import styles from './Modal.module.scss';

interface ModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  modalComponentStyle?: CSSProperties;
  paperComponentStyle?: CSSProperties;
}

const c = 'modal-component';

function Modal({ open, setOpen, modalComponentStyle: modalComponentStyles, paperComponentStyle: paperComponentStyles, children }: PropsWithChildren<ModalProps>) {
  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <div
        onClick={handleCloseModal}
        className={classNames(styles[`${c}__outside`], {
          [styles['closed']]: !open
        })}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={classNames(styles[c], {
            [styles['closed']]: !open
          })}
          style={modalComponentStyles}
        >
          <Paper style={paperComponentStyles}>{children} </Paper>
          <div className={styles[`${c}__close`]} onClick={handleCloseModal}>
            <Image src={Close} alt="close" />
          </div>
        </div>
      </div>

      <div>
        <Sheet
          detent="content-height"
          className={styles[`${c}__sheet`]}
          isOpen={open}
          onClose={() => setOpen(false)}
        >
          <Sheet.Container>
            <Sheet.Header />
            <Sheet.Content>{children}</Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={() => setOpen(false)} />
        </Sheet>
      </div>
    </>
  );
}

export default Modal;
