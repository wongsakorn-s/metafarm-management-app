import { Activity, FlaskConical, Sparkles, UtensilsCrossed } from "lucide-react";

import PublicLayout from "@/components/public-layout";

const heroStats = [
  {
    icon: FlaskConical,
    label: "จุดเด่นสำคัญ",
    value: "มีน้ำตาล Trehalulose ที่พบได้ยาก และร่างกายค่อย ๆ ดูดซึม",
  },
  {
    icon: UtensilsCrossed,
    label: "มูลค่าเชิงอาหาร",
    value: "เหมาะกับการต่อยอดเป็นวัตถุดิบพรีเมียมและเมนูเฉพาะทาง",
  },
  {
    icon: Activity,
    label: "คุณค่าต่อสุขภาพ",
    value: "มีสารสำคัญจากธรรมชาติหลายชนิดที่ช่วยเพิ่มความน่าสนใจของผลิตภัณฑ์",
  },
];

function PlaceholderImage({
  alt,
  className = "",
  imgClassName = "",
}: {
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-100 ${className}`}>
      <img
        src="/pictures/default.png"
        alt={alt}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}

export default function StinglessBeeHoney() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-[88rem] px-5 py-6 md:px-8 md:py-12">
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-[0_30px_80px_-40px_rgba(68,64,60,0.35)]">
            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="flex flex-col justify-between gap-8 p-7 md:p-9 lg:p-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-900">
                    <Sparkles className="h-4 w-4" />
                    ข้อมูลเบื้องต้นของน้ำผึ้งชันโรง
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-[2rem] font-black leading-[1.05] text-stone-900 md:text-[2.35rem] lg:text-[2.7rem]">
                      น้ำผึ้งชันโรง
                    </h1>
                    <p className="max-w-2xl text-[0.98rem] leading-8 text-stone-700 md:text-base">
                      น้ำผึ้งชันโรงมีลักษณะเด่นต่างจากน้ำผึ้งทั่วไป ทั้งด้านรสชาติ โครงสร้างน้ำตาล
                      และเรื่องราวของแหล่งผลิต จึงเหมาะกับการสื่อสารคุณค่าเชิงสุขภาพและเชิงอาหารไปพร้อมกัน
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {heroStats.map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4"
                      >
                        <Icon className="h-5 w-5 text-amber-600" />
                        <p className="mt-3 text-sm font-bold text-stone-500">{label}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative min-h-[320px] bg-stone-100 lg:min-h-full">
                <PlaceholderImage alt="ภาพน้ำผึ้งชันโรง" className="h-full rounded-none border-0" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/20 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
