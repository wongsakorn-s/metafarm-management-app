import { Link, NavLink, Outlet } from "react-router-dom";
import { Bug, LayoutDashboard, QrCode } from "lucide-react";

import logo from "@/assets/logo2.png";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hives", label: "Hives", icon: Bug },
  { to: "/print-qr", label: "Labels", icon: QrCode },
];

export default function AppShell() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,251,235,0.82))] backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-start px-4 py-2 md:justify-between md:px-6 md:py-3">
          <Link
            to="/"
            className="flex items-center rounded-full px-1 py-1 transition hover:bg-white/20 md:bg-white/85 md:px-2 md:py-2 md:shadow-sm md:hover:bg-white"
          >
            <img src={logo} alt="MetaFarm Logo" className="h-12 w-auto md:h-12" />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition",
                    isActive ? "bg-stone-900 text-white shadow-sm" : "hover:bg-white/80 hover:text-stone-900"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto flex w-[calc(100%-1rem)] max-w-sm items-center justify-around rounded-[1.75rem] border border-white/70 bg-[rgba(255,252,247,0.92)] p-2 shadow-[0_20px_45px_-28px_rgba(41,37,36,0.38)] backdrop-blur-xl print:hidden md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-[82px] flex-col items-center gap-1 rounded-[1.25rem] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition duration-200",
                  isActive
                    ? "bg-[linear-gradient(180deg,#f59e0b,#f59e0b)] text-white shadow-[0_16px_24px_-18px_rgba(245,158,11,0.9)]"
                    : "hover:bg-amber-50/80 hover:text-stone-700"
                )
              }
            >
              <Icon className="h-[15px] w-[15px]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
