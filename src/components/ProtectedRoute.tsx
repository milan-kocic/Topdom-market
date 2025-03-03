import React from 'react';
import { useProtectedRoute } from '@/lib/auth/auth-context';

const ProtectedRoute: React.FC<{
  allowedRoles: string[];
  children: React.ReactNode;
}> = ({ children, allowedRoles }) => {
  const { loading } = useProtectedRoute(allowedRoles);

  if (loading) {
    return <div>Loading...</div>; // ili neki drugi indikator učitavanja
  }

  return <>{children}</>;
};

export default ProtectedRoute;
