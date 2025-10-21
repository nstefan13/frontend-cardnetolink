'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Logo from 'public/svgs/logo.svg';

import styles from './Header.module.scss';

const c = 'header';

function Header() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/');
  };

  return (
    <div className={styles[`${c}`]}>
      <div onClick={handleRedirect} className={styles[`${c}-logo`]}>
        <Image quality={100} height={40} src={Logo} alt="logo" />
      </div>
      <div className={styles[`${c}-text`]}>Card Creator</div>
    </div>
  );
}

export default Header;
