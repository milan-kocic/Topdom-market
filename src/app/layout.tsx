import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--playfair-font'
});

export const metadata: Metadata = {
  title: 'TopDom Market',
  description: 'Prodavnica građevinskog materijala i opreme za kuću'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='sr'>
      <body className={`${inter.className} ${playfair.variable}`}>
        <AuthProvider>
          {children}
          <Toaster position='top-right' />
        </AuthProvider>
      </body>
    </html>
  );
}
