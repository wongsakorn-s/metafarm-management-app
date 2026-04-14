import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import logo from "@/assets/logo1.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hiveService } from "@/services/api";

interface HiveLabel {
  id: number;
  hive_id: string;
  name?: string;
}

export default function QRPrint() {
  const [hives, setHives] = useState<HiveLabel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    hiveService.getAll().then((res) => setHives(res.data)).catch(console.error);
  }, []);

  return (
    <div className="page-shell space-y-6 print:max-w-none print:px-0 print:pb-0 print:pt-0">
      <section className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" className="pl-0" onClick={() => navigate("/hives")}>
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้ารัง
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          พิมพ์ป้าย
        </Button>
      </section>

      <Card
        id="print-root"
        className="print-root print:mx-auto print:w-[190mm] print:border-0 print:bg-white print:shadow-none"
      >
        <CardHeader className="print:hidden">
          <CardDescription className="text-xs font-semibold uppercase text-amber-700">
            สถานี QR
          </CardDescription>
          <CardTitle>ป้ายรหัสประจำรัง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 print:space-y-0 print:p-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-3 print:gap-2">
            {hives.map((hive) => (
              <div
                key={hive.id}
                className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-6 text-center print:flex print:h-[48mm] print:break-inside-avoid print:flex-col print:items-center print:rounded-none print:border-solid print:p-2"
              >
                <div className="mx-auto flex w-fit items-center rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 print:rounded-lg print:p-1">
                  <QRCodeSVG
                    value={hive.hive_id}
                    size={108}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: logo,
                      height: 42,
                      width: 42,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="mt-4 text-xl font-semibold uppercase text-stone-900 print:mt-1.5 print:text-[11px]">
                  {hive.hive_id}
                </p>
                {hive.name && (
                  <p className="mt-1 text-sm text-stone-500 print:max-w-full print:text-[9px] print:leading-tight">
                    {hive.name}
                  </p>
                )}
              </div>
            ))}
          </div>

          {hives.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 p-10 text-center text-sm text-stone-500">
              ไม่พบข้อมูลรังสำหรับสร้าง QR
            </div>
          )}

          <div className="rounded-[1.75rem] bg-sky-50 p-6 text-sm text-sky-900 print:hidden">
            <p className="font-semibold">คำแนะนำการพิมพ์</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>ใช้กระดาษ A4 แบบสติกเกอร์หรือกระดาษแข็งเพื่อให้นำไปติดรังได้ง่าย</li>
              <li>เปิด Background Graphics หากโลโก้ตรงกลางจางเกินไป</li>
              <li>ขนาดที่ตั้งไว้เน้นให้สแกนได้ง่ายแม้อยู่กลางแจ้ง</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          html, body {
            background: white !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          body * {
            visibility: hidden;
          }

          #print-root,
          #print-root * {
            visibility: visible;
          }

          #print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 190mm;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            overflow: hidden !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .print-root {
            min-height: 0 !important;
          }

          main,
          .min-h-screen,
          .page-shell {
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}
