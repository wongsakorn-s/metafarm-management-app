import { useEffect, useState } from "react";
import { Bug, Cloud, Droplets, Leaf, Wind } from "lucide-react";

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
  location_name_th?: string;
  description: string;
  temp_c: number;
  humidity: number;
  wind_speed_mps?: number;
  cloudiness_pct?: number;
  source_name?: string;
  icon?: string;
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

function translateStatus(status: string): string {
  switch (status) {
    case "Strong":
      return "แข็งแรง";
    case "Normal":
      return "ปกติ";
    case "Weak":
      return "อ่อนแอ";
    case "Empty":
      return "ว่าง";
    default:
      return status;
  }
}

function getWeatherIconUrl(icon?: string): string | null {
  if (!icon) {
    return null;
  }

  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function getWeatherTheme(icon?: string) {
  if (!icon) {
    return {
      cardClassName: "bg-[linear-gradient(180deg,#1c1917,#292524)] transition-all duration-500",
      badgeClassName: "bg-white/10 motion-safe:animate-[pulse_5s_ease-in-out_infinite]",
      sourceClassName: "text-stone-300",
    };
  }

  if (icon.startsWith("01")) {
    return {
      cardClassName:
        "bg-[linear-gradient(180deg,#0f766e,#115e59,#134e4a)] transition-all duration-500 shadow-[0_18px_50px_rgba(13,148,136,0.18)]",
      badgeClassName:
        "bg-amber-200/20 ring-1 ring-amber-100/20 motion-safe:animate-[pulse_4.5s_ease-in-out_infinite]",
      sourceClassName: "text-amber-100/80",
    };
  }

  if (icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04")) {
    return {
      cardClassName:
        "bg-[linear-gradient(180deg,#334155,#475569,#1e293b)] transition-all duration-500 shadow-[0_18px_50px_rgba(71,85,105,0.18)]",
      badgeClassName:
        "bg-sky-100/10 ring-1 ring-sky-100/15 motion-safe:animate-[pulse_5.5s_ease-in-out_infinite]",
      sourceClassName: "text-slate-200/80",
    };
  }

  if (icon.startsWith("09") || icon.startsWith("10")) {
    return {
      cardClassName:
        "bg-[linear-gradient(180deg,#1d4ed8,#1e40af,#172554)] transition-all duration-500 shadow-[0_18px_50px_rgba(30,64,175,0.2)]",
      badgeClassName:
        "bg-cyan-100/10 ring-1 ring-cyan-100/20 motion-safe:animate-[pulse_3.8s_ease-in-out_infinite]",
      sourceClassName: "text-cyan-100/80",
    };
  }

  if (icon.startsWith("11")) {
    return {
      cardClassName:
        "bg-[linear-gradient(180deg,#312e81,#3730a3,#1e1b4b)] transition-all duration-500 shadow-[0_18px_50px_rgba(55,48,163,0.2)]",
      badgeClassName:
        "bg-yellow-100/10 ring-1 ring-yellow-100/20 motion-safe:animate-[ping_5s_cubic-bezier(0,0,0.2,1)_infinite]",
      sourceClassName: "text-yellow-100/80",
    };
  }

  if (icon.startsWith("13")) {
    return {
      cardClassName:
        "bg-[linear-gradient(180deg,#e0f2fe,#bae6fd,#7dd3fc)] text-sky-950 transition-all duration-500 shadow-[0_18px_50px_rgba(125,211,252,0.25)]",
      badgeClassName:
        "bg-white/40 ring-1 ring-sky-100/40 motion-safe:animate-[pulse_6s_ease-in-out_infinite]",
      sourceClassName: "text-sky-900/70",
    };
  }

  return {
    cardClassName: "bg-[linear-gradient(180deg,#1c1917,#292524)] transition-all duration-500",
    badgeClassName: "bg-white/10 motion-safe:animate-[pulse_5s_ease-in-out_infinite]",
    sourceClassName: "text-stone-300",
  };
}

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
          <h1 className="mt-2 text-3xl font-bold text-stone-900">กำลังโหลดข้อมูล</h1>
        </div>
      </div>
    );
  }

  const weatherIconUrl = getWeatherIconUrl(weather?.icon);
  const weatherTheme = getWeatherTheme(weather?.icon);

  return (
    <div className="page-shell space-y-6 md:space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-amber-200 bg-[linear-gradient(180deg,rgba(161,98,7,0.96),rgba(180,83,9,0.92),rgba(120,53,15,0.92))] text-white shadow-2xl shadow-amber-900/20">
          <CardContent className="relative flex min-h-[340px] flex-col p-6 md:min-h-[420px] md:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),transparent)]" />
            <h1 className="relative max-w-[15ch] text-[2rem] font-black leading-[1.05] tracking-tight md:max-w-[10ch] md:text-7xl">
              ภาพรวม<br/>ฟาร์มผึ้ง
            </h1>

            <div className="relative mt-10 grid grid-cols-2 gap-4 md:mt-auto md:grid-cols-3 md:gap-6">
              {statCards(stats).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`rounded-[1.5rem] border border-white/10 bg-black/10 p-4 backdrop-blur-md md:rounded-[2rem] md:p-6 ${item.className}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-50/90 md:text-xs">
                        {item.label}
                      </span>
                      <div className="rounded-xl bg-white/10 p-2 text-amber-50/90">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-5 text-3xl font-black md:text-5xl">{item.value.toLocaleString()}</p>
                    <p className="mt-1 text-xs font-bold text-amber-50/70">{item.suffix}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-2xl shadow-stone-200/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-6 md:p-8 pb-4">
            <CardTitle className="text-2xl md:text-3xl font-black">สภาพอากาศ</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0 space-y-6">
            {weather ? (
              <>
                <div className={`rounded-[2rem] p-6 text-white md:p-8 ${weatherTheme.cardClassName}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">
                        {weather.location_name_th || weather.location_name || "พื้นที่ฟาร์ม"}
                      </p>
                      <p className="mt-3 text-2xl font-black md:text-4xl">{weather.description}</p>
                    </div>
                    {weatherIconUrl && (
                      <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white/10 p-2 md:h-24 md:w-24 ${weatherTheme.badgeClassName}`}>
                        <img src={weatherIconUrl} alt={weather.description} className="h-full w-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="mt-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-white/60">อุณหภูมิ</p>
                    <p className="mt-2 text-5xl font-black md:text-7xl">{Math.round(weather.temp_c)}°C</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: "ความชื้น", value: `${weather.humidity}%`, icon: Droplets, color: "text-blue-500" },
                    { label: "ความเร็วลม", value: `${weather.wind_speed_mps?.toFixed(1)} m/s`, icon: Wind, color: "text-sky-500" },
                    { label: "เมฆ", value: `${weather.cloudiness_pct?.toFixed(0)}%`, icon: Cloud, color: "text-stone-500" }
                  ].map((item, i) => (
                    <div key={i} className="rounded-[1.5rem] bg-stone-50 p-5 border border-stone-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        {item.label}
                      </div>
                      <p className="text-2xl font-black text-stone-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[2rem] border-2 border-dashed border-stone-100 p-10 text-center text-stone-400">
                ไม่มีข้อมูลอากาศ
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-2xl shadow-stone-200/50 rounded-[2.5rem]">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-2xl md:text-3xl font-black">สถานะรังผึ้ง</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0 space-y-4">
            {Object.entries(stats.status_summary ?? {}).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-[1.75rem] bg-stone-50 p-5 border border-stone-100 transition-all hover:bg-white hover:shadow-lg"
              >
                <p className="text-sm font-black uppercase tracking-widest text-stone-500">
                  {translateStatus(status)}
                </p>
                <p className="text-3xl font-black text-stone-900">{count}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-stone-200/50 rounded-[2.5rem]">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-2xl md:text-3xl font-black">ผลผลิตล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0 space-y-4">
            {stats.recent_harvests.length > 0 ? (
              stats.recent_harvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-center justify-between gap-4 rounded-[1.75rem] bg-stone-50 p-5 border border-stone-100"
                >
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-stone-900">{harvest.hive_name}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                      {new Date(harvest.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-amber-600">{harvest.honey} ml</p>
                    <p className="text-xs font-bold text-stone-400">{harvest.propolis}g Propolis</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-stone-400 font-bold">ไม่มีข้อมูลผลผลิต</div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
