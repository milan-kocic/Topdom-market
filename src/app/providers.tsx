'use client';

import { AuthProvider } from '@/lib/auth/auth-context';
import { AppProvider } from '@/lib/context/AppContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
      <Toaster />
    </AuthProvider>
  );
}
