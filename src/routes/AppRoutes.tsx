import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from '../context/AuthContext';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Settings from '../pages/Settings';
import UserManagement from '../pages/UserManagement';
import RoleManagement from '../pages/RoleManagement';
import Projects from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import Transactions from '../pages/Transactions';
import TransactionDetail from '../pages/TransactionDetail';
import { PettyCashDashboard } from '../pages/PettyCash/Dashboard';
import { FundList } from '../pages/PettyCash/FundList';
import { FundDetail } from '../pages/PettyCash/FundDetail';
import { PettyCashTransactions } from '../pages/PettyCash/Transactions';
import { PettyCashReconciliations } from '../pages/PettyCash/Reconciliations';
import { PettyCashSettings } from '../pages/PettyCash/Settings';
import { Layout, MobileLayout } from '../components/layout';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            {isMobile ? <MobileLayout /> : <Layout />}
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transaction/:id" element={<TransactionDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Petty Cash Routes */}
        <Route path="/petty-cash">
          <Route index element={<PettyCashDashboard />} />
          <Route path="funds" element={<FundList />} />
          <Route path="funds/:id" element={<FundDetail />} />
          <Route path="transactions" element={<PettyCashTransactions />} />
          <Route path="reconciliations" element={<PettyCashReconciliations />} />
          <Route path="settings" element={<PettyCashSettings />} />
        </Route>

        {/* User and Role Management Routes */}
        <Route path="/users" element={<UserManagement />} />
        <Route path="/roles" element={<RoleManagement />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}