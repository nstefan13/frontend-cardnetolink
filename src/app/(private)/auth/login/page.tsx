'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Button from '@/components/reusables/Button/Button';
import Input from '@/components/reusables/Input/Input';
import { useAuth } from '@/contexts/AuthContext';

import Technologist from 'public/technologist.png';

import styles from '../Auth.module.scss';

const c = 'auth';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    login(email, password)
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        toast.error('Login failed');
      });
  };

  const handleRedirect = () => {
    router.push('/auth/register');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className={styles[`${c}`]}>
      <div className={styles[`${c}-content`]}>
        <div className={styles[`${c}-content-logo`]}>
          <Image width={40} height={40} src={Technologist} alt="logo" />
        </div>
        <div className={styles[`${c}-content-text`]}>
          <h1 className={styles[`${c}-content-text-title`]}>Login</h1>
          <p className={styles[`${c}-content-text-subtitle`]}>Log in to existing card</p>
        </div>
      </div>

      <div className={styles[`${c}-form`]}>
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <div className={styles[`${c}-form-buttons`]}>
          <Button style={{ fontSize: '16px', fontWeight: '400' }} onClick={handleSubmit} fullWidth>
            Login
          </Button>
          <div className={styles[`${c}-form-buttons-row`]}>
            <Button onClick={handleRedirect} variant="text" fullWidth>
              Create new account
            </Button>
            <Button
              className={styles[`${c}-form-buttons-error`]}
              onClick={handleForgotPassword}
              variant="text"
              fullWidth
            >
              Forgot Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
