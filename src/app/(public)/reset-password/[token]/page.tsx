'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/reusables/Button/Button';
import Input from '@/components/reusables/Input/Input';
import { AuthApi } from '@/api';

import LockedIcon from 'public/svgs/locked.svg';
import CheckIcon from 'public/svgs/check.svg';

import styles from './ResetPassword.module.scss';

const c = 'reset-password';

function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    AuthApi.resetPassword(params.token, password)
      .then(() => {
        setSubmitted(true);
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
            <p className={styles[`${c}-top-text-title`]}>New Password</p>
            <p className={styles[`${c}-top-text-subtitle`]}>
              Enter your new password and make sure you don’t forget it this time
            </p>
          </div>
        </div>
        <div className={styles[`${c}-form`]}>
          <Input
            id="password"
            label="Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            disabled={loading}
            text="Change password"
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
            <Image src={CheckIcon} alt="envelope icon" />
          </div>
          <div className={styles[`${c}-top-text`]}>
            <p className={styles[`${c}-top-text-title`]}>Password Changed</p>
          </div>
        </div>
        <div className={styles[`${c}-form`]}>
          <Button
            text="Login Now"
            variant="contained"
            fullWidth
            onClick={() => router.push('/auth/login')}
          />
        </div>
      </div>
    );
  }
}

export default ResetPasswordPage;
