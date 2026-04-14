import { Facebook, Mail, MapPin, Phone, Sparkles } from "lucide-react";

import PublicLayout from "@/components/public-layout";

const contactDetails = [
  {
    icon: MapPin,
    label: "ที่ตั้งฟาร์ม",
    value: "ต.หนองไร่ อ.ปลวกแดง จ.ระยอง",
    tone: "amber" as const,
  },
  {
    icon: Phone,
    label: "เบอร์โทร",
    value: "รออัปเดต",
    tone: "stone" as const,
  },
  {
    icon: Mail,
    label: "อีเมล",
    value: "รออัปเดต",
    tone: "stone" as const,
  },
  {
    icon: Facebook,
    label: "เพจเฟซบุ๊ก",
    value: "รออัปเดต",
    tone: "stone" as const,
  },
];

const toneClassMap = {
  amber: {
    card: "border-amber-200 bg-[linear-gradient(180deg,#fffaf0,#fff3d6)]",
    icon: "bg-white text-amber-600 shadow-amber-100/70",
  },
  stone: {
    card: "border-stone-200 bg-stone-50/90",
    icon: "bg-white text-stone-700 shadow-stone-200/70",
  },
};

export default function Contact() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-[88rem] px-5 py-6 md:px-8 md:py-12">
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="rounded-[2.5rem] border border-stone-200 bg-white p-7 shadow-[0_30px_80px_-40px_rgba(68,64,60,0.35)] md:p-9 lg:p-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-900">
                  <Sparkles className="h-4 w-4" />
                  ติดต่อ MetaFarm
                </div>

                <div className="space-y-3">
                  <h1 className="text-[2rem] font-black leading-[1.05] text-stone-900 md:text-[2.35rem] lg:text-[2.7rem]">
                    ติดต่อเรา
                  </h1>
                  <p className="text-[0.98rem] leading-8 text-stone-700 md:text-base">
                    ช่องทางติดต่อหลักของฟาร์ม
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {contactDetails.map(({ icon: Icon, label, value, tone }) => {
                  const toneClass = toneClassMap[tone];

                  return (
                    <article
                      key={label}
                      className={`rounded-[1.75rem] border p-5 shadow-[0_20px_50px_-35px_rgba(68,64,60,0.28)] ${toneClass.card}`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${toneClass.icon}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="mt-5 text-sm font-bold text-stone-500">{label}</p>
                      <p className="mt-2 text-lg font-black leading-8 text-stone-900">{value}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
