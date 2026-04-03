import { createPortal } from "react-dom";
import { useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { ScanLine, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: Props) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const scannerContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_24%)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between px-4 pb-4 pt-5 md:px-6 md:pb-5 md:pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">สแกนเนอร์</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">สแกน QR ของรังผึ้ง</h2>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-0 pb-0 md:px-6 md:pb-6">
          <div className="relative h-full w-full overflow-hidden bg-black md:h-[min(78vh,760px)] md:max-h-[760px] md:max-w-[760px] md:rounded-[2.5rem] md:border md:border-white/10 md:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <QrReader
              onResult={(result) => {
                if (result) onScan(result.getText());
              }}
              constraints={{ facingMode: "environment" }}
              containerStyle={{ width: "100%", height: "100%", paddingTop: "0" }}
              videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-black/52 md:bg-black/58" />

              <div className="relative flex flex-col items-center justify-center px-4">
                <div className="relative h-[18rem] w-[18rem] max-w-[82vw] rounded-[2rem] border border-amber-300/80 bg-transparent shadow-[0_0_0_999px_rgba(0,0,0,0.78)] md:h-[24rem] md:w-[24rem]">
                  <div className="absolute inset-x-4 top-4 h-1 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(253,224,71,0.9)] animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="absolute left-4 top-4 rounded-full bg-black/55 p-2 text-amber-200">
                    <ScanLine className="h-5 w-5" />
                  </div>
                </div>
                <p className="relative mt-6 rounded-full bg-black/55 px-4 py-2 text-center text-sm text-amber-50 backdrop-blur md:text-base">
                  จัด QR ให้อยู่ในกรอบเพื่อเข้าสู่หน้ารังอัตโนมัติ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 8%; }
          50% { top: 88%; }
        }
      `}</style>
    </div>
  );

  return createPortal(scannerContent, document.body);
}
