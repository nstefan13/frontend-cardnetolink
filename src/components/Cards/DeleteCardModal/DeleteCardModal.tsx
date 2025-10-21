import Image from 'next/image';
import toast from 'react-hot-toast';
import { useState } from 'react';

import Modal from '@/components/reusables/Modal/Modal';
import Button from '@/components/reusables/Button/Button';
import { deleteCardByUuid } from '@/api/cardApi';

import WarningEmoji from 'public/svgs/warning-emoji.svg';

import styles from './DeleteCardModal.module.scss';

interface DeleteCardModalProps {
  uuid?: string;
  open: boolean;
  onSubmit: () => void;
  setOpen: (open: boolean) => void;
}

const c = 'delete-card-modal';

function DeleteCardModal({ uuid, open, onSubmit, setOpen }: DeleteCardModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = () => {
    if (uuid) {
      setLoading(true);
      deleteCardByUuid(uuid)
        .then(() => {
          toast.success('Card successfully deleted.');
          onSubmit();
        })
        .catch(() => {
          toast.success('Could not delete card');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className={styles[c]}>
        <div className={styles[`${c}-top`]}>
          <div className={styles[`${c}-top-icon`]}>
            <Image src={WarningEmoji} alt="warning" />
          </div>
          <div className={styles[`${c}-top-text`]}>Are you sure you want to delete this Card?</div>
        </div>
        <div className={styles[`${c}-actions`]}>
          <Button
            text={'No, keep it'}
            onClick={() => setOpen(false)}
            variant="contained"
            fullWidth
          />
          <Button
            disabled={loading}
            onClick={handleConfirmDelete}
            className={styles[`${c}-actions-confirm`]}
            text={"Yes, I'm sure"}
            variant="text"
            fullWidth
          />
        </div>
      </div>
    </Modal>
  );
}

export default DeleteCardModal;
