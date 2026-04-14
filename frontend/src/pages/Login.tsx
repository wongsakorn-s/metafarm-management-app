import axios from "axios";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import logo from "@/assets/logo2.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api";

type LocationState = {
  from?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = state?.from && state.from !== "/login" ? state.from : "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await authService.login(username.trim(), password, rememberMe);
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.detail || "เข้าสู่ระบบไม่สำเร็จ");
      } else {
        setErrorMessage("เข้าสู่ระบบไม่สำเร็จ");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0,#f8fafc)] px-4 py-8 md:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <Card className="w-full max-w-md border-stone-200 bg-white shadow-[0_30px_60px_-30px_rgba(41,37,36,0.22)]">
          <CardHeader className="space-y-4 px-6 pt-7 text-center md:px-8 md:pt-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับหน้าแรก
            </button>

            <img src={logo} alt="MetaFarm" className="mx-auto h-16 w-auto" />

            <div className="space-y-2">
              <CardTitle className="text-3xl font-black text-stone-900">เข้าสู่ระบบ</CardTitle>
              <p className="text-sm leading-7 text-stone-500">
                สำหรับผู้ดูแลระบบฟาร์ม กรุณากรอกชื่อผู้ใช้และรหัสผ่าน
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-7 md:px-8 md:pb-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-bold text-stone-700">
                  ชื่อผู้ใช้
                </label>
                <Input
                  id="username"
                  data-testid="login-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="กรอกชื่อผู้ใช้"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-stone-700">
                  รหัสผ่าน
                </label>
                <Input
                  id="password"
                  data-testid="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete={rememberMe ? "current-password" : "off"}
                  required
                  className="h-12 rounded-2xl"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                <span>จดจำการเข้าสู่ระบบบนอุปกรณ์นี้</span>
              </label>

              {errorMessage ? (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  data-testid="login-error"
                >
                  {errorMessage}
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-amber-500 text-sm font-black hover:bg-amber-600"
                disabled={isSubmitting}
                data-testid="login-submit"
              >
                {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
