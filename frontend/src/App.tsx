import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AuthGuard from "@/components/auth-guard";
import AppShell from "@/components/app-shell";
import ServerWakingBanner from "@/components/server-waking-banner";
import Dashboard from "@/pages/Dashboard";
import HiveDetail from "@/pages/HiveDetail";
import HiveList from "@/pages/HiveList";
import Login from "@/pages/Login";
import QRPrint from "@/pages/QRPrint";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ServerWakingBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hives" element={<HiveList />} />
            <Route path="/hives/:hive_id" element={<HiveDetail />} />
            <Route path="/print-qr" element={<QRPrint />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
