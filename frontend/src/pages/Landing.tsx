import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Droplets, Sprout, ArrowRight, QrCode, 
  BookOpen, Mail, Phone, ShoppingBag, GraduationCap, 
  ChevronRight, Facebook, Info, Menu, X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Tab = "home" | "details" | "products" | "pocketbook" | "contact";

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { id: Tab, label: string }[] = [
    { id: "home", label: "หน้าแรก" },
    { id: "details", label: "รายละเอียด" },
    { id: "products", label: "สินค้า/บริการ" },
    { id: "pocketbook", label: "สมุดพก" },
    { id: "contact", label: "ติดต่อเรา" },
  ];

  const handleTabChange = (id: Tab) => {
    setActiveTab(id);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans text-stone-900 selection:bg-amber-200">
      {/* Dynamic Navbar */}
      <nav className="sticky top-0 z-[100] border-b border-stone-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
              <Sprout className="h-7 w-7" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-stone-800 md:text-3xl">MetaFarm</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`px-5 py-2.5 text-base font-bold transition-all rounded-full ${
                  activeTab === item.id ? "bg-amber-500 text-white" : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="ml-4 h-8 w-[1px] bg-stone-200" />
            <Button 
              className="ml-4 rounded-full bg-stone-900 px-8 py-6 text-base font-bold hover:bg-stone-800"
              onClick={() => navigate("/dashboard")}
            >
              Management
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 lg:hidden">
             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-stone-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </Button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-full bg-white border-b border-stone-200 p-5 shadow-2xl animate-in slide-in-from-top-2 duration-300 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center justify-between w-full p-4 rounded-2xl text-lg font-bold ${
                    activeTab === item.id ? "bg-amber-50 text-amber-600" : "text-stone-600 active:bg-stone-50"
                  }`}
                >
                  {item.label}
                  {activeTab === item.id && <ChevronRight className="h-5 w-5" />}
                </button>
              ))}
              <Button 
                className="mt-4 w-full rounded-2xl bg-stone-900 py-7 text-xl font-bold"
                onClick={() => navigate("/dashboard")}
              >
                Management Access
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-16">
        {activeTab === "home" && (
          <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8 md:space-y-12">
                <div className="inline-flex items-center gap-3 rounded-full bg-lime-100 px-5 py-2 text-sm font-bold text-lime-800 md:text-base">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-lime-500 animate-pulse" />
                  Smart Beekeeping Solution
                </div>
                <h1 className="text-6xl font-black leading-[1.05] tracking-tight md:text-8xl lg:text-9xl">
                  Meta<span className="text-amber-500">Farm</span><br />
                  <span className="text-stone-400">Future.</span>
                </h1>
                <p className="text-xl leading-relaxed text-stone-600 md:text-2xl lg:max-w-xl">
                  นวัตกรรมการจัดการฟาร์มผึ้งชันโรงที่ใหญ่ที่สุด เราเปลี่ยนการดูแลแบบดั้งเดิมให้เป็นระบบดิจิทัลที่ทุกคนเข้าถึงได้
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                   <Button size="lg" className="h-16 rounded-3xl bg-amber-500 px-10 text-xl font-black shadow-xl shadow-amber-200 hover:bg-amber-600" onClick={() => handleTabChange("details")}>
                     เริ่มสำรวจ <ArrowRight className="ml-2 h-6 w-6" />
                   </Button>
                </div>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3.5rem] bg-stone-200 shadow-2xl md:aspect-square">
                 <img src="https://images.unsplash.com/photo-1589648751789-c8779698967b?auto=format&fit=crop&q=80&w=1200" className="h-full w-full object-cover" alt="Farm Hero" />
                 <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
              </div>
            </div>
          </section>
        )}

        {activeTab === "details" && (
          <section className="space-y-12 animate-in fade-in duration-700 md:space-y-24">
            <div className="max-w-3xl">
              <h2 className="text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl">ชันโรงขนเงิน<br/>มหัศจรรย์ธรรมชาติ</h2>
              <p className="mt-6 text-xl text-stone-500 md:text-2xl">ข้อมูลสายพันธุ์และความพิเศษของน้ำผึ้งชันโรงขนเงิน</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
              <Card className="group overflow-hidden border-none bg-white shadow-2xl shadow-stone-200/50 rounded-[2.5rem]">
                <CardContent className="p-0">
                  <div className="h-72 overflow-hidden md:h-96">
                    <img src="https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&q=80&w=800" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Bee Detail" />
                  </div>
                  <div className="p-8 md:p-12 space-y-5">
                    <h3 className="text-3xl font-black md:text-4xl text-stone-800">Tetragonula pegdeni</h3>
                    <p className="text-lg md:text-xl text-stone-600 leading-relaxed">
                      ชันโรงขนเงินเป็นสายพันธุ์ที่มีความสำคัญทางเศรษฐกิจ เลี้ยงง่าย ไม่ดุร้าย 
                      และให้ผลผลิตน้ำผึ้งที่มีคุณภาพสูง มีคุณสมบัติช่วยผสมเกสรให้พืชผลในฟาร์มได้อย่างยอดเยี่ยม
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden border-none bg-amber-50 shadow-2xl shadow-amber-200/20 rounded-[2.5rem]">
                <CardContent className="p-0">
                  <div className="h-72 overflow-hidden md:h-96">
                    <img src="https://images.unsplash.com/photo-1558583082-409143c794ca?auto=format&fit=crop&q=80&w=800" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Honey Detail" />
                  </div>
                  <div className="p-8 md:p-12 space-y-5">
                    <h3 className="text-3xl font-black md:text-4xl text-amber-900">น้ำผึ้งคุณภาพ Premium</h3>
                    <p className="text-lg md:text-xl text-amber-800/80 leading-relaxed">
                      น้ำผึ้งชันโรงขนเงินมีรสชาติ "เปรี้ยวอมหวาน" (Tangy Sweet) 
                      มีสารต้านอนุมูลอิสระและฟลาโวนอยด์สูงมาก ช่วยเสริมสร้างภูมิคุ้มกันและยับยั้งแบคทีเรียได้ดี
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {activeTab === "products" && (
          <section className="space-y-12 animate-in fade-in duration-700">
            <h2 className="text-5xl font-black tracking-tighter md:text-7xl">สินค้าและบริการ</h2>
            
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "รังสมบูรณ์", desc: "รังชันโรงขนเงินพร้อมเลี้ยง มีนางพญาและไข่อ่อนครบชุด", icon: Sprout, color: "bg-lime-500 text-white" },
                { title: "รังเปล่า", desc: "กล่องเลี้ยงมาตรฐาน MetaFarm ออกแบบเพื่อการระบายอากาศ", icon: ShoppingBag, color: "bg-stone-800 text-white" },
                { title: "น้ำผึ้งชันโรง", desc: "น้ำผึ้งแท้ 100% บรรจุขวดสวยงาม พร้อมทาน", icon: Droplets, color: "bg-amber-500 text-white" },
                { title: "อบรมการแยกขยายรัง", desc: "สอนเทคนิคการแยกนางพญาจากมือโปร", icon: GraduationCap, color: "bg-blue-500 text-white" },
                { title: "อบรมการแปรรูป", desc: "การกรองน้ำผึ้งและการเพิ่มมูลค่าผลิตภัณฑ์", icon: Info, color: "bg-purple-500 text-white" },
              ].map((item, i) => (
                <Card key={i} className="group border-none bg-white p-2 rounded-[2rem] shadow-xl shadow-stone-200/40 transition-all hover:scale-[1.02]">
                  <CardContent className="p-8 space-y-6">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${item.color}`}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-stone-800">{item.title}</h4>
                      <p className="text-lg text-stone-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {activeTab === "pocketbook" && (
          <section className="space-y-12 animate-in fade-in duration-700">
             <div className="max-w-2xl space-y-6">
                <BookOpen className="h-20 w-20 text-amber-500" />
                <h2 className="text-5xl font-black tracking-tighter md:text-7xl">สมุดพก MetaFarm</h2>
                <p className="text-xl md:text-2xl text-stone-600">
                  คู่มือการเลี้ยงชันโรงที่ละเอียดที่สุด ครบถ้วนในเล่มเดียว มีให้เลือก 3 ขนาดตามการใช้งาน
                </p>
             </div>

             <div className="grid gap-6 md:grid-cols-3">
                {["A1", "A4", "A5"].map((size) => (
                  <Card key={size} className="group relative overflow-hidden border-none bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 transition-all hover:bg-stone-900">
                    <h3 className="text-6xl font-black mb-4 group-hover:text-amber-500 transition-colors">Size {size}</h3>
                    <p className="text-xl text-stone-500 group-hover:text-stone-400">ขนาดพกพายอดนิยม {size}</p>
                    <div className="mt-12 flex justify-end opacity-10 group-hover:opacity-100 transition-opacity">
                      <ShoppingBag className="h-16 w-16 text-white" />
                    </div>
                  </Card>
                ))}
             </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="mx-auto max-w-4xl space-y-12 animate-in fade-in duration-700">
             <div className="text-center space-y-4">
                <h2 className="text-5xl font-black tracking-tighter md:text-7xl">ติดต่อเรา</h2>
                <p className="text-xl text-stone-500">พร้อมให้คำปรึกษาและบริการทุกวัน</p>
             </div>
             
             <Card className="border-none bg-stone-900 text-white rounded-[3rem] shadow-2xl overflow-hidden">
                <CardContent className="p-10 md:p-20">
                   <div className="grid gap-10 md:grid-cols-2">
                      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10">
                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
                            <Phone className="h-8 w-8" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">โทรศัพท์</p>
                            <p className="text-2xl font-black">08x-xxx-xxxx</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10">
                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500/20 text-lime-500">
                            <Mail className="h-8 w-8" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">อีเมล</p>
                            <p className="text-xl font-black break-all">contact@metafarm.com</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10">
                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-500">
                            <Facebook className="h-8 w-8" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Facebook</p>
                            <p className="text-2xl font-black">MetaFarm Official</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10">
                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
                            <QrCode className="h-8 w-8" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Line ID</p>
                            <p className="text-2xl font-black">@metafarm</p>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </section>
        )}
      </main>

      {/* Mobile-Friendly Footer */}
      <footer className="mt-20 border-t border-stone-200 bg-white py-16 px-6 text-center text-stone-500">
        <div className="flex justify-center gap-4 mb-8">
           <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center"><Facebook className="h-5 w-5" /></div>
           <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center"><Mail className="h-5 w-5" /></div>
        </div>
        <p className="text-lg font-bold text-stone-800 mb-2">MetaFarm Innovation System</p>
        <p className="text-base">© 2026 MetaFarm. All rights reserved.</p>
      </footer>
    </div>
  );
}
