import { GoogleTagManager } from '@next/third-parties/google';
import { Onest } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';
import classNames from 'classnames';

import Header from '@/components/layout/Header/Header';
import Paper from '@/components/reusables/Paper/Paper';

import '@/styles/global.scss';
import 'react-tooltip/dist/react-tooltip.css';
import Head from 'next/head';

const onest = Onest({
  subsets: ['latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800']
});

const c = 'layout';

export const metadata: Metadata = {
  title: 'Cards | cardneto.link ',
  icons: '/favicon.ico'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <GoogleTagManager gtmId="GTM-PFPK5TG6" />
      </Head>
      <body className={classNames(onest.className, c)}>
        <Header />
        <Paper>{children}</Paper>
        <Toaster position="top-left" />
      </body>
    </html>
  );
}
