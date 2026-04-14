import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Facebook, Mail, Menu, X } from "lucide-react";

import logo from "@/assets/logo2.png";
import { publicNavItems } from "@/config/public-routes";
import { Button } from "@/components/ui/button";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans text-stone-900 selection:bg-amber-200">
      <nav className="sticky top-0 z-[100] border-b border-stone-200/80 bg-[rgba(250,250,249,0.9)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-2.5 md:px-8 md:py-3">
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className="flex items-center rounded-2xl transition-opacity hover:opacity-85"
          >
            <img src={logo} alt="MetaFarm" className="h-11 w-auto md:h-12" />
          </button>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white/90 p-1 shadow-lg shadow-stone-200/40">
              {publicNavItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActivePath(item.path)
                      ? "bg-stone-900 text-white shadow-md shadow-stone-300/40"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden items-center lg:flex">
            <Button
              className="rounded-full bg-amber-500 px-6 py-5 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600 md:text-base"
              onClick={() => navigate("/dashboard")}
            >
              เข้าสู่ระบบ
            </Button>
          </div>

          <div className="flex items-center lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl border-stone-200 bg-white shadow-sm"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="absolute inset-x-4 top-[calc(100%+0.75rem)] animate-in slide-in-from-top-2 rounded-[2rem] border border-stone-200 bg-white/95 p-4 shadow-2xl shadow-stone-300/30 backdrop-blur-xl duration-300 lg:hidden">
            <div className="space-y-3">
              <Button
                type="button"
                className="h-12 w-full rounded-2xl bg-amber-500 text-sm font-black text-white hover:bg-amber-600"
                onClick={() => handleNavigate("/dashboard")}
              >
                เข้าสู่ระบบ
              </Button>

              <div className="grid gap-2">
                {publicNavItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-base font-bold transition ${
                      isActivePath(item.path)
                        ? "bg-amber-50 text-amber-700"
                        : "border border-transparent bg-stone-50 text-stone-700 active:bg-stone-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-5 w-5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {children}

      <footer className="mt-24 border-t border-stone-200 bg-white px-6 py-10 text-center text-stone-500">
        <div className="mb-5 flex justify-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
            <Facebook className="h-5 w-5" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
            <Mail className="h-5 w-5" />
          </div>
        </div>
        <p className="mb-1.5 text-lg font-bold text-stone-800">MetaFarm Innovation System</p>
        <p className="text-base">© 2026 MetaFarm. All rights reserved.</p>
      </footer>
    </div>
  );
}
