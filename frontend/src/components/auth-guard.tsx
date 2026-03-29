import { Navigate, Outlet, useLocation } from "react-router-dom";

import { authStorage } from "@/services/api";

export default function AuthGuard() {
  const location = useLocation();
  const token = authStorage.getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
