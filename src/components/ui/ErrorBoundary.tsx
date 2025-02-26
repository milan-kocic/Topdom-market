import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full'>
              <h2 className='text-2xl font-bold text-red-600 mb-4'>
                Oops! Nešto nije u redu.
              </h2>
              <p className='text-gray-600 mb-4'>
                Došlo je do greške pri učitavanju ove stranice. Molimo vas da
                osvežite stranicu ili pokušate kasnije.
              </p>
              <button
                onClick={() => window.location.reload()}
                className='w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors'
              >
                Osveži stranicu
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
