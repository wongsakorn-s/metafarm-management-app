import { createPortal } from "react-dom";
import { QrReader } from "react-qr-reader";
import { ScanLine, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: Props) {
  const scannerContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_28%),rgba(3,2,2,0.995)] text-white">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Scanner</p>
          <h2 className="mt-2 text-2xl font-semibold">Scan hive QR code</h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <QrReader
          onResult={(result) => {
            if (result) onScan(result.getText());
          }}
          constraints={{ facingMode: "environment" }}
          containerStyle={{ width: "100%", height: "100%", paddingTop: "0" }}
          videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative h-72 w-72 max-w-[80vw] rounded-[2rem] border border-amber-300/70 shadow-[0_0_0_999px_rgba(0,0,0,0.72)]">
            <div className="absolute inset-x-3 top-4 h-1 rounded-full bg-amber-300 shadow-[0_0_15px_rgba(253,224,71,0.85)] animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute left-4 top-4 rounded-full bg-black/55 p-2 text-amber-200">
              <ScanLine className="h-5 w-5" />
            </div>
          </div>
          <p className="relative mt-8 rounded-full bg-black/45 px-4 py-2 text-sm text-amber-50 backdrop-blur">
            จัด QR ให้อยู่ในกรอบเพื่อเข้าสู่หน้ารังอัตโนมัติ
          </p>
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
