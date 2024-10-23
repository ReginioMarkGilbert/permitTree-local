import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRoles } from '../utils/auth';

const ProtectedRoute = ({ children, roles }) => {
    const userRoles = getUserRoles();

    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    if (roles && !roles.some(role => userRoles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
