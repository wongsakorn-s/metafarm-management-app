import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Leaf, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import PublicLayout from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";

const heroStats = [
  {
    icon: ShieldCheck,
    label: "เลี้ยงง่าย",
    value: "เหมาะกับฟาร์มในไทย",
  },
  {
    icon: MapPin,
    label: "การกระจายตัว",
    value: "พบได้ทั่วประเทศ",
  },
  {
    icon: Leaf,
    label: "บทบาทสำคัญ",
    value: "ช่วยผสมเกสรพืชเศรษฐกิจ",
  },
];

const beeDetails = [
  "เป็นชันโรงขนาดเล็ก ส่วนหัวและอกมีสีดำ ส่วนท้องสีน้ำตาลอ่อน ขาสีดำ และปีกใส",
  "ชอบสร้างรังในโพรงไม้หรือช่องของสิ่งก่อสร้าง เช่น ผนังอาคาร เสาไม้ และท่อพีวีซี",
  "ปากทางเข้ารังสร้างจากชัน มีลักษณะเป็นท่อสั้น ๆ สีน้ำตาลเข้ม เนื้อชันอ่อนนุ่ม",
  "สามารถดำรงชีวิตได้ดีในหลายพื้นที่ของประเทศไทย",
  "เหมาะสำหรับเลี้ยงเป็นแมลงเศรษฐกิจและช่วยผสมเกสรในสวนผลไม้",
];

const farmBenefits = [
  {
    title: "เป็นแมลงผสมเกสรสำคัญ",
    description:
      "งานวิจัยในไทยและต่างประเทศระบุว่าชันโรงมีบทบาทเด่นต่อการผสมเกสรของพืชในระบบธรรมชาติและพืชเศรษฐกิจหลายชนิด",
  },
  {
    title: "นิยมจัดการในกล่องรัง",
    description:
      "ในประเทศไทยมีการเลี้ยงชันโรงหลายชนิดเชิงพาณิชย์ และชันโรงขนเงินเป็นหนึ่งในชนิดที่เหมาะกับการติดตามและจัดการในฟาร์ม",
  },
  {
    title: "ต่อยอดรายได้ได้หลายทาง",
    description:
      "ฟาร์มสามารถใช้รังเพื่อช่วยผสมเกสร เพิ่มผลผลิต และต่อยอดเป็นรายได้จากน้ำผึ้งชันโรง ชัน และการจำหน่ายรัง",
  },
];

const galleryImages = [
  {
    src: "/pictures/Picture2.png",
    alt: "ภาพชันโรงขนเงินบริเวณทางเข้ารัง",
  },
  {
    src: "/pictures/Picture3.png",
    alt: "ภาพชันโรงขนเงินภายในระบบเลี้ยง",
  },
];

export default function StinglessBee() {
  const [activeSlide, setActiveSlide] = useState(0);

  const handlePrevious = () => {
    setActiveSlide((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const handleNext = () => {
    setActiveSlide((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentImage = galleryImages[activeSlide];

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
                    ข้อมูลเบื้องต้นของชันโรง
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-[2rem] font-black leading-[1.05] text-stone-900 md:text-[2.35rem] lg:text-[2.7rem]">
                      ชันโรง
                    </h1>
                    <p className="max-w-2xl text-[0.98rem] leading-8 text-stone-700 md:text-base">
                      ชันโรงเป็นกลุ่มผึ้งไม่มีเหล็กในที่มีความสำคัญต่อระบบนิเวศและภาคเกษตร
                      ในประเทศไทยมีการเลี้ยงชันโรงเพิ่มขึ้นอย่างต่อเนื่อง
                      เพราะช่วยผสมเกสรพืชเศรษฐกิจและต่อยอดเป็นผลผลิตจากรังได้หลายรูปแบบ
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
                <img
                  src="/pictures/Picture1.png"
                  alt="ภาพชันโรง"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/50 via-stone-900/10 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_45px_-30px_rgba(68,64,60,0.35)]">
              <CardContent className="p-0">
                <div className="space-y-6 p-6 md:p-8">
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase text-stone-500">
                      ภาพประกอบ
                    </p>
                    <h3 className="text-2xl font-black text-stone-900">ลักษณะของชันโรงในระบบเลี้ยง</h3>
                  </div>

                  <div className="relative h-[340px] overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-50 md:h-[420px]">
                    {currentImage.src ? (
                      <img
                        src={currentImage.src}
                        alt={currentImage.alt}
                        className="block h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(180deg,#fafaf9,#f1f5f9)]" />
                    )}

                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition hover:bg-white"
                      aria-label="ภาพก่อนหน้า"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition hover:bg-white"
                      aria-label="ภาพถัดไป"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-stone-100 px-5 py-4">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image.alt}-${index}`}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition ${
                        activeSlide === index ? "w-8 bg-stone-800" : "w-2.5 bg-stone-300 hover:bg-stone-400"
                      }`}
                      aria-label={`ไปที่ภาพที่ ${index + 1}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_50px_-30px_rgba(68,64,60,0.35)]">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase text-amber-700">
                    สายพันธุ์แนะนำ
                  </p>
                  <h2 className="text-2xl font-black text-stone-900 md:text-[2rem]">
                    ชันโรงขนเงิน
                  </h2>
                  <p className="text-base leading-8 text-stone-700">
                    เป็นชันโรงที่พบและถูกนำมาเลี้ยงในประเทศไทยอย่างแพร่หลาย
                    เหมาะกับงานจัดการรังในฟาร์มและงานผสมเกสร
                    โดยมีลักษณะเด่นที่สังเกตได้จากทางเข้ารังที่สร้างด้วยชัน
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-amber-50 px-5 py-5">
                    <p className="text-sm font-bold text-amber-800">จุดเด่น</p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">
                      ปรับตัวได้ดีในสภาพอากาศไทย เลี้ยงในกล่องรังได้ และเหมาะกับการติดตามข้อมูลการจัดการรัง
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-stone-50 px-5 py-5">
                    <p className="text-sm font-bold text-stone-700">การใช้งานในฟาร์ม</p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">
                      นิยมใช้เพื่อเสริมการผสมเกสรในสวนผลไม้ แปลงปลูก และระบบเกษตรที่ต้องการแมลงผสมเกสรประจำแปลง
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {beeDetails.map((detail, index) => (
                    <div
                      key={detail}
                      className="flex gap-4 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-4 text-stone-700"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-800">
                        {index + 1}
                      </div>
                      <p className="pt-0.5 text-sm leading-7 md:text-[0.97rem]">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-8">
          <Card className="rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_50px_-30px_rgba(68,64,60,0.35)]">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase text-amber-700">
                    บทบาทในฟาร์ม
                  </p>
                  <h2 className="text-2xl font-black text-stone-900 md:text-[2rem]">
                    ทำไมชันโรงถึงเหมาะกับระบบเกษตรสมัยใหม่
                  </h2>
                  <p className="text-base leading-8 text-stone-700">
                    ชันโรงไม่ได้มีประโยชน์แค่การผลิตน้ำผึ้ง
                    แต่ยังเป็นเครื่องมือสำคัญของฟาร์มที่ต้องการเพิ่มการติดผล
                    ลดการพึ่งพาการผสมเกสรแบบธรรมชาติอย่างเดียว
                    และสร้างมูลค่าเพิ่มจากผลิตภัณฑ์ของรัง
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {farmBenefits.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5"
                    >
                      <p className="text-lg font-black text-stone-900">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-stone-700">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </PublicLayout>
  );
}
