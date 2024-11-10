import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Settings from "../pages/Settings";
import UserManagement from "../pages/UserManagement";
import RoleManagement from "../pages/RoleManagement";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import Transactions from "../pages/Transactions";
import TransactionDetail from "../pages/TransactionDetail";
import { PettyCashDashboard } from "../pages/PettyCash/Dashboard";
import { FundList } from "../pages/PettyCash/FundList";
import { FundDetail } from "../pages/PettyCash/FundDetail";
import { PettyCashTransactions } from "../pages/PettyCash/Transactions";
import { PettyCashReconciliations } from "../pages/PettyCash/Reconciliations";
import { PettyCashSettings } from "../pages/PettyCash/Settings";
import { Layout } from "../components/layout";
import { MobileLayout } from "../components/MobileLayout";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredPermission?: string;
};

function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    // You can replace this with a proper loading component
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // You might want to navigate to an unauthorized page instead
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={!user ? <Landing /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            {isMobile ? <MobileLayout /> : <Layout />}
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Transactions */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute requiredPermission="read:transactions">
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction/:id"
          element={
            <ProtectedRoute requiredPermission="read:transactions">
              <TransactionDetail />
            </ProtectedRoute>
          }
        />

        {/* Projects */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

        {/* Petty Cash Routes */}
        <Route path="/petty-cash">
          <Route
            index
            element={
              <ProtectedRoute requiredPermission="manage:petty-cash">
                <PettyCashDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="funds"
            element={
              <ProtectedRoute requiredPermission="manage:funds">
                <FundList />
              </ProtectedRoute>
            }
          />
          <Route
            path="funds/:id"
            element={
              <ProtectedRoute requiredPermission="manage:funds">
                <FundDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions"
            element={
              <ProtectedRoute requiredPermission="manage:transactions">
                <PettyCashTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="reconciliations"
            element={
              <ProtectedRoute requiredPermission="manage:reconciliations">
                <PettyCashReconciliations />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredPermission="manage:petty-cash">
                <PettyCashSettings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* User and Role Management Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="manage:users">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute requiredPermission="manage:roles">
              <RoleManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}
