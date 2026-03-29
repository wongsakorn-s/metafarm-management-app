import axios from "axios";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = state?.from && state.from !== "/login" ? state.from : "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await authService.login(username, password);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7,transparent_38%),linear-gradient(180deg,#fff9ec,#fff3db_50%,#f8fafc)] px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-amber-100 bg-[linear-gradient(145deg,rgba(120,53,15,0.96),rgba(245,158,11,0.88))] p-8 text-white shadow-[0_35px_80px_-35px_rgba(120,53,15,0.75)]">
            <img src={logo} alt="MetaFarm" className="h-16 w-auto rounded-2xl bg-white/90 p-2" />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">MetaFarm Admin</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">เข้าสู่ระบบเพื่อจัดการฟาร์มผึ้งชันโรง</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-amber-50/90">
              หน้าหลักของระบบถูกป้องกันด้วย access token และ refresh token แล้ว ผู้ดูแลต้องล็อกอินก่อนจึงจะเข้าถึง dashboard,
              การจัดการรัง, ผลผลิต, inspection และ QR ได้
            </p>
          </section>

          <Card className="border-white/80 bg-white/92 shadow-[0_30px_60px_-30px_rgba(41,37,36,0.35)] backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl text-stone-900">เข้าสู่ระบบ</CardTitle>
              <p className="text-sm text-stone-500">ใช้บัญชีผู้ดูแลที่ถูก bootstrap เข้า database</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Username</label>
                  <Input
                    data-testid="login-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Password</label>
                  <Input
                    data-testid="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="login-error">
                    {errorMessage}
                  </div>
                ) : null}

                <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="login-submit">
                  {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
