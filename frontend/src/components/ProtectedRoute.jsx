import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ allowedRoles = ['ADMIN', 'MANAGER', 'STAFF'] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
