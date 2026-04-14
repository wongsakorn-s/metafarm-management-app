import { Mail, MapPin, Phone, Sparkles } from "lucide-react";

import PublicLayout from "@/components/public-layout";

const contactItems = [
  {
    icon: MapPin,
    label: "ที่ตั้งฟาร์ม",
    value: "ต.หนองไร่ อ.ปลวกแดง จ.ระยอง",
  },
  {
    icon: Phone,
    label: "เบอร์โทร",
    value: "รออัปเดต",
  },
  {
    icon: Mail,
    label: "อีเมล",
    value: "รออัปเดต",
  },
];

export default function Contact() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-[88rem] px-5 py-6 md:px-8 md:py-12">
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-[0_30px_80px_-40px_rgba(68,64,60,0.35)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col justify-center gap-8 p-7 md:p-9 lg:p-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-900">
                    <Sparkles className="h-4 w-4" />
                    ติดต่อ MetaFarm
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-[2rem] font-black leading-[1.05] text-stone-900 md:text-[2.35rem] lg:text-[2.7rem]">
                      ติดต่อเรา
                    </h1>
                    <p className="max-w-2xl text-[0.98rem] leading-8 text-stone-700 md:text-base">
                      หากต้องการสอบถามข้อมูลเกี่ยวกับฟาร์ม ชันโรง หรือน้ำผึ้งชันโรง
                      สามารถติดต่อผ่านข้อมูลด้านล่างได้
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {contactItems.map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-start gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-500">{label}</p>
                          <p className="mt-1 text-sm leading-7 text-stone-900">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-h-[320px] bg-stone-100 lg:min-h-full">
                <img
                  src="/pictures/default.png"
                  alt="ภาพประกอบหน้าติดต่อเรา"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
