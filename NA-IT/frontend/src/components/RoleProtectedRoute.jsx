import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(AuthContext);
  const userRole = user?.user?.role;

  if (loading) return <div>Loading...</div>;

  if (!user || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
    // Or: return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleProtectedRoute; 