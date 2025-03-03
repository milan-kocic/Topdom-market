'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Home } from 'lucide-react';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Main Content */}
      <div className='flex-1'>
        <main className='p-6'>{children}</main>
      </div>
    </div>
  );
}
