import { useEffect, useState } from "react";
import { Bug, CloudSun, Droplets, Leaf, Thermometer, Wind } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService, weatherService } from "@/services/api";

interface DashboardStats {
  total_hives: number;
  total_honey_ml: number;
  status_summary?: Record<string, number>;
  recent_harvests: Array<{
    id: number;
    hive_name: string;
    honey: number;
    propolis: number;
    date: string;
  }>;
}

interface WeatherData {
  location_name?: string;
  description: string;
  temp_c: number;
  humidity: number;
}

const statCards = (stats: DashboardStats) => [
  {
    label: "รังทั้งหมด",
    value: stats.total_hives,
    suffix: "รัง",
    icon: Bug,
    className: "",
  },
  {
    label: "ผลผลิตน้ำผึ้ง",
    value: stats.total_honey_ml,
    suffix: "มล.",
    icon: Droplets,
    className: "",
  },
  {
    label: "รังแข็งแรง",
    value: stats.status_summary?.Strong ?? 0,
    suffix: "รัง",
    icon: Leaf,
    className: "col-span-2 md:col-span-1",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    dashboardService.getStats().then((res) => setStats(res.data)).catch(console.error);
    weatherService.getCurrent().then((res) => setWeather(res.data)).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-amber-100 p-5 text-amber-600 shadow-sm">
          <Bug className="h-10 w-10 animate-pulse" />
        </div>
        <div className="text-center">
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">กำลังโหลดข้อมูล</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-5 md:space-y-6">
      <section className="grid gap-4 md:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(180deg,rgba(161,98,7,0.96),rgba(180,83,9,0.92),rgba(120,53,15,0.92))] text-white">
          <CardContent className="relative flex min-h-[300px] flex-col p-5 md:min-h-[396px] md:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
            <div className="pointer-events-none absolute -right-10 top-4 h-24 w-24 rounded-full bg-amber-200/10 blur-3xl md:h-36 md:w-36" />
            <h1 className="relative max-w-[15ch] text-[1.55rem] font-semibold leading-[1.02] tracking-tight md:max-w-[10ch] md:text-[4rem]">
              ภาพรวมฟาร์มผึ้ง
            </h1>

            <div className="relative mt-8 grid grid-cols-2 gap-3 md:mt-auto md:grid-cols-3 md:gap-4">
              {statCards(stats).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`rounded-[1.25rem] border border-white/10 bg-black/10 p-3.5 backdrop-blur-sm md:rounded-[1.75rem] md:p-5 ${item.className}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-50/90 md:text-[11px] md:tracking-[0.28em]">
                        {item.label}
                      </span>
                      <div className="rounded-full bg-white/10 p-2 text-amber-50/90">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold md:text-3xl">{item.value}</p>
                    <p className="mt-1 text-[11px] text-amber-50/80">{item.suffix}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-lime-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,240,0.94))]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl md:text-2xl">สภาพอากาศ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            {weather ? (
              <>
                <div className="rounded-[1.5rem] bg-stone-900 p-4 text-white md:rounded-[1.75rem] md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-300 md:text-xs md:tracking-[0.28em]">
                        {weather.location_name || "พื้นที่ฟาร์ม"}
                      </p>
                      <p className="mt-2 text-xl font-semibold capitalize md:text-2xl">{weather.description}</p>
                    </div>
                    <div className="rounded-full bg-white/10 p-3">
                      <CloudSun className="h-5 w-5 text-amber-300 md:h-6 md:w-6" />
                    </div>
                  </div>
                  <p className="mt-6 text-4xl font-semibold md:mt-8 md:text-5xl">{Math.round(weather.temp_c)}°</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] bg-white p-3.5 shadow-sm md:rounded-[1.5rem] md:p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      อุณหภูมิ
                    </div>
                    <p className="mt-3 text-xl font-semibold text-stone-900 md:text-2xl">{weather.temp_c.toFixed(1)}°C</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white p-3.5 shadow-sm md:rounded-[1.5rem] md:p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <Wind className="h-4 w-4 text-lime-600" />
                      ความชื้น
                    </div>
                    <p className="mt-3 text-xl font-semibold text-stone-900 md:text-2xl">{weather.humidity}%</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 p-6 text-sm text-stone-500">
                ยังไม่มีข้อมูลสภาพอากาศ
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">สถานะรัง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.status_summary ?? {}).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-[1.25rem] border border-amber-100 bg-amber-50/60 px-4 py-3.5 md:rounded-[1.35rem] md:py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 md:tracking-[0.24em]">
                  {status === "Strong" ? "แข็งแรง" : status === "Normal" ? "ปกติ" : status === "Weak" ? "อ่อนแอ" : status === "Empty" ? "ว่าง" : status}
                </p>
                <p className="text-2xl font-semibold text-stone-900 md:text-3xl">{count}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">ผลผลิตล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent_harvests.length > 0 ? (
              stats.recent_harvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-stone-200 bg-white/80 px-4 py-3.5 md:rounded-[1.5rem] md:py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-stone-900">{harvest.hive_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500 md:tracking-[0.2em]">
                      {new Date(harvest.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-amber-700 md:text-lg">{harvest.honey} มล.</p>
                    <p className="text-xs text-stone-500">{harvest.propolis} กรัม โพรโพลิส</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-stone-500">
                ยังไม่มีข้อมูลผลผลิต
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
