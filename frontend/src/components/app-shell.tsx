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
    <div className="min-h-screen pb-24 md:pb-0 bg-[#fafaf9]">
      <header className="sticky top-0 z-[60] border-b border-stone-200 bg-white/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8 md:py-4">
          <Link
            to="/"
            className="flex items-center"
          >
            <img src={logo} alt="MetaFarm" className="h-10 w-auto md:h-12" />
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-5 py-2.5 text-base font-bold transition",
                      isActive ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            
            <Button 
              variant="ghost" 
              className="h-11 rounded-2xl px-4 font-bold text-red-500 hover:bg-red-50 hover:text-red-600" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>

      {/* Modern Bottom Nav for PWA */}
      <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-lg items-center justify-around rounded-[2.5rem] border border-stone-200 bg-white/95 p-3 shadow-2xl shadow-stone-300/50 backdrop-blur-xl print:hidden md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-3xl py-3 transition-all duration-300",
                  isActive
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105"
                    : "text-stone-400 active:bg-stone-50 active:scale-95"
                )
              }
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
