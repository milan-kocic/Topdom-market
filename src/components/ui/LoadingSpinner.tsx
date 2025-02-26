import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({
  size = 'medium',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin`}
      ></div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className='fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center'>
      <LoadingSpinner size='large' />
    </div>
  );
}
