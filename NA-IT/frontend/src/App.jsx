import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // Import the new page
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Import the new layout
import ItemsListPage from './pages/ItemsListPage';
import AddItemPage from './pages/AddItemPage';

import IssuancePage from './pages/IssuancePage';
import EmployeesPage from './pages/EmployeesPage';
import CategoriesPage from './pages/CategoriesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import RoleProtectedRoute from './components/RoleProtectedRoute';


function App() {
  const { user, loading } = useContext(AuthContext);

  return (
    <Router>
      <div>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
          />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/items" element={
              <RoleProtectedRoute allowedRoles={["Admin", "Operator", "Management"]}>
                <ItemsListPage />
              </RoleProtectedRoute>
            } />
            <Route path="/add-item" element={
              <RoleProtectedRoute allowedRoles={["Admin", "Operator"]}>
                <AddItemPage />
              </RoleProtectedRoute>
            } />

            <Route path="/issuance" element={
              <RoleProtectedRoute allowedRoles={["Admin", "Operator"]}>
                <IssuancePage />
              </RoleProtectedRoute>
            } />
            <Route path="/employees" element={
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <EmployeesPage />
              </RoleProtectedRoute>
            } />
            <Route path="/categories" element={
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <CategoriesPage />
              </RoleProtectedRoute>
            } />
            <Route path="/reports" element={
              <RoleProtectedRoute allowedRoles={["Admin", "Management"]}>
                <ReportsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/users" element={
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <UsersPage />
              </RoleProtectedRoute>
            } />

            {/* Redirect from root to dashboard for logged-in users */}
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Optional: Add a 404 Not Found page */}
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
