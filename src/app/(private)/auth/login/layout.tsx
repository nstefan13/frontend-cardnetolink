import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | cardneto.com'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
