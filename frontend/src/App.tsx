import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import AuthGuard from "@/components/auth-guard";
import AppShell from "@/components/app-shell";
import ServerWakingBanner from "@/components/server-waking-banner";
import { publicRoutes } from "@/config/public-routes";
import Dashboard from "@/pages/Dashboard";
import HiveDetail from "@/pages/HiveDetail";
import HiveList from "@/pages/HiveList";
import Login from "@/pages/Login";
import QRPrint from "@/pages/QRPrint";
import UserManagement from "@/pages/UserManagement";
import { authStorage } from "@/services/api";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const role = authStorage.getUserRole();
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ServerWakingBanner />
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hives" element={<HiveList />} />
            <Route path="/hives/:hive_id" element={<HiveDetail />} />
            <Route path="/print-qr" element={<QRPrint />} />
            
            {/* Admin Only */}
            <Route path="/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
