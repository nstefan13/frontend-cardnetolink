'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Input from '@/components/reusables/Input/Input';
import Button from '@/components/reusables/Button/Button';

import { useAuth } from '@/contexts/AuthContext';

import Hand from 'public/hand-emoji.png';

import styles from '../Auth.module.scss';

const c = 'auth';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    register(email, password)
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        toast.error('Register failed');
      });
  };

  const handleRedirect = () => {
    router.push('/auth/login');
  };

  return (
    <div className={styles[`${c}`]}>
      <div className={styles[`${c}-content`]}>
        <div className={styles[`${c}-content-logo`]}>
          <Image width={40} height={40} src={Hand} alt="logo" />
        </div>
        <div className={styles[`${c}-content-text`]}>
          <h1 className={styles[`${c}-content-text-title`]}>Register</h1>
          <p className={styles[`${c}-content-text-subtitle`]}>Enter the data for you new account</p>
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
        <div>
          <Button style={{ fontSize: '16px', fontWeight: '400' }} onClick={handleSubmit} fullWidth>
            Create
          </Button>
          <Button onClick={handleRedirect} variant="underline" fullWidth>
            Log in to existing account
          </Button>
        </div>
      </div>
    </div>
  );
}
