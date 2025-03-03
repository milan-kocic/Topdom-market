'use client';

import { useAuth } from '@/lib/auth/auth-context';
import UserManagement from '@/components/admin/UserManagement';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminUsersPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='h-64 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirekcija će se desiti u useEffect-u
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <UserManagement />
    </div>
  );
}
