import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import PublicLayout from "@/components/public-layout";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <main className="mx-auto max-w-[88rem] px-5 py-6 md:px-8 md:py-12">
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-[0_30px_80px_-40px_rgba(68,64,60,0.35)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex h-full flex-col justify-between gap-10 p-7 md:p-9 lg:p-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-900">
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                    หน้าแรก
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-[2.1rem] font-black leading-[1.05] text-stone-900 md:text-[2.45rem] lg:text-[2.7rem] lg:whitespace-nowrap">
                      เรื่องราวของ MetaFarm
                    </h1>
                  </div>

                  <div className="max-w-2xl space-y-4 text-[0.98rem] leading-8 text-stone-700 md:text-base">
                    <p>
                      MetaFarm เป็นสวนปาล์มน้ำมันบนเนื้อที่ 50 ไร่ ตั้งอยู่ที่ ต.หนองไร่อ.ปลวกแดง จ.ระยอง และเริ่มเลี้ยงผึ้งชันโรงตั้งแต่ปี พ.ศ. 2565
                    </p>
                    <p>
                      ในช่วงแรกได้ทดลองเลี้ยงหลายสายพันธุ์ เช่น ขนเงิน ถ้วยดำ จิ๋วดุ ปากแตร อิตาม่า และบิงฮามี ก่อนจะพบว่าชันโรงขนเงินเหมาะสมที่สุดกับสภาพพื้นที่และอากาศของฟาร์ม
                    </p>
                    <p>
                      ปัจจุบัน MetaFarm พัฒนารังเลี้ยงชันโรงขนเงินด้วยตนเองให้มีเอกลักษณ์ แข็งแรง และรองรับการใช้งานจริงในฟาร์มได้อย่างมีประสิทธิภาพ
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="h-12 rounded-2xl bg-amber-500 px-7 text-base font-black shadow-lg shadow-amber-200 hover:bg-amber-600"
                    onClick={() => navigate("/stingless-bee")}
                  >
                    ดูหน้าถัดไป <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[320px] bg-stone-900 lg:min-h-full">
                <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
                  <source src="/videos/metafarm_video.mp4" type="video/mp4" />
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                </video>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-900/10 to-transparent" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
