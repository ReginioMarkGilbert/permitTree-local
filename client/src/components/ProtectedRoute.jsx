import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRoles } from '@/utils/auth';
import ErrorPage from './errorPage';

const ProtectedRoute = ({ children, roles }) => {
   const userRoles = getUserRoles();

   if (!isAuthenticated()) {
      return <Navigate to="/auth" replace />;
   }

   if (roles && !roles.some(role => userRoles.includes(role))) {
      return <ErrorPage status={403} />;
   }

   return children;
};

export default ProtectedRoute;
