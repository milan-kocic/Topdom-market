'use client';

import { useAuth } from '@/lib/auth/auth-context';
import UserProfile from '@/components/user/UserProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (!user) {
    return null; // Redirekcija će se desiti u useEffect-u
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <UserProfile />
    </div>
  );
}
