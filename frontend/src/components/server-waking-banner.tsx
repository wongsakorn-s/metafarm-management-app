import { useSyncExternalStore } from "react";
import { CloudLightning, LoaderCircle } from "lucide-react";

import { serverWakeStore } from "@/services/api";

export default function ServerWakingBanner() {
  const isServerWaking = useSyncExternalStore(serverWakeStore.subscribe, serverWakeStore.getSnapshot);

  if (!isServerWaking) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-3 z-[70] flex justify-center px-3">
      <div className="flex max-w-xl items-center gap-3 rounded-full border border-amber-200 bg-white/95 px-4 py-3 text-sm text-stone-700 shadow-[0_18px_40px_-22px_rgba(41,37,36,0.45)] backdrop-blur-xl">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <CloudLightning className="h-4 w-4" />
          <LoaderCircle className="absolute -right-1 -top-1 h-4 w-4 animate-spin rounded-full bg-white text-amber-500" />
        </span>
        <div>
          <p className="font-semibold text-stone-900">Server กำลังตื่น</p>
          <p className="text-xs text-stone-500">request แรกบน Render free tier อาจใช้เวลาสักครู่</p>
        </div>
      </div>
    </div>
  );
}
