import { AuthProvider } from '@/contexts/AuthContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Card | cardneto.com'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}
