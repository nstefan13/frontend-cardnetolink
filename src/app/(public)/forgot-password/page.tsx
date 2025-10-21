'use client';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useState } from 'react';

import Button from '@/components/reusables/Button/Button';
import Input from '@/components/reusables/Input/Input';
import { AuthApi } from '@/api';

import LockedIcon from 'public/svgs/locked.svg';
import EnvelopeIcon from 'public/svgs/envelope.svg';

import styles from './ForgotPassword.module.scss';

const c = 'forgot-password';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    AuthApi.forgotPassword(email)
      .then(() => {
        setSubmitted(true);
      })
      .catch(() => {
        toast.error('Something went wrong. Please check the submitted email.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!submitted) {
    return (
      <div className={styles[c]}>
        <div className={styles[`${c}-top`]}>
          <div className={styles[`${c}-top-icon`]}>
            <Image src={LockedIcon} alt="locked icon" />
          </div>
          <div className={styles[`${c}-top-text`]}>
            <p className={styles[`${c}-top-text-title`]}>Forgot Password?</p>
            <p className={styles[`${c}-top-text-subtitle`]}>
              Enter your email and we’ll send you a link to change your password
            </p>
          </div>
        </div>
        <div className={styles[`${c}-form`]}>
          <Input
            id="email"
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            disabled={loading}
            text="Send link to Email"
            variant="contained"
            onClick={handleSubmit}
            fullWidth
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles[c]}>
        <div className={styles[`${c}-top`]}>
          <div className={styles[`${c}-top-icon`]}>
            <Image src={EnvelopeIcon} alt="envelope icon" />
          </div>
          <div className={styles[`${c}-top-text`]}>
            <p className={styles[`${c}-top-text-title`]}>Email Sent!</p>
            <p className={styles[`${c}-top-text-subtitle`]}>
              Check your email and open the link we sent to continue
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default ForgotPasswordPage;
