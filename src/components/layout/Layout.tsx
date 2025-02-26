import React, { ReactNode } from 'react';
import { TopBar } from '../TopBar';
import { Navigation } from '../Navigation';
import { Footer } from '../Footer';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useApp } from '../../context/AppContext';
import { FullPageLoader } from '../ui/LoadingSpinner';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state } = useApp();
  const isLoading = Object.values(state.loading).some(
    (status) => status === 'loading'
  );

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-white flex flex-col'>
        {isLoading && <FullPageLoader />}
        <TopBar />
        <Navigation />
        <main className='flex-grow'>
          {state.error && (
            <div
              className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
              role='alert'
            >
              <strong className='font-bold'>Greška!</strong>
              <span className='block sm:inline'> {state.error.message}</span>
            </div>
          )}
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
