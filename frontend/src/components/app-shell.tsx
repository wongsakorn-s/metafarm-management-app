import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bug, LayoutDashboard, LogOut, QrCode, Users } from "lucide-react";

import logo from "@/assets/logo2.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authService, authStorage } from "@/services/api";

export default function AppShell() {
  const navigate = useNavigate();
  const userRole = authStorage.getUserRole();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/", { replace: true });
  };

  const navItems = [
    { to: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
    { to: "/hives", label: "รังผึ้ง", icon: Bug },
    { to: "/print-qr", label: "ป้าย QR", icon: QrCode },
  ];

  if (userRole === "admin") {
    navItems.push({ to: "/users", label: "สมาชิก", icon: Users });
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-0">
      <header className="sticky top-0 z-[60] border-b border-stone-200/80 bg-[rgba(250,250,249,0.9)] backdrop-blur-2xl print:hidden">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 py-2.5 md:px-8 md:py-3">
          <Link to="/" className="flex items-center rounded-2xl transition-opacity hover:opacity-85">
            <img src={logo} alt="MetaFarm" className="h-11 w-auto md:h-12" />
          </Link>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-stone-200 bg-white/90 p-1 shadow-lg shadow-stone-200/40">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-bold transition-all lg:text-base",
                      isActive
                        ? "bg-stone-900 text-white shadow-md shadow-stone-300/40"
                        : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center">
            <Button
              variant="ghost"
              className="rounded-full border border-red-200 bg-white/80 px-4 py-4 text-sm font-bold text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 md:px-5 md:text-base"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[88rem]">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-[2.25rem] border border-stone-200 bg-white/95 p-2.5 shadow-2xl shadow-stone-300/50 backdrop-blur-xl print:hidden md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-3xl py-2.5 transition-all duration-300",
                  isActive
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105"
                    : "text-stone-400 active:bg-stone-50 active:scale-95"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-black">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
