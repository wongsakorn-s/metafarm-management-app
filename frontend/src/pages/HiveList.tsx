import { useEffect, useState } from "react";
import { Plus, QrCode, Search, Trash2, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

import QRScanner from "@/components/QRScanner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authStorage, hiveService } from "@/services/api";

interface Hive {
  id: number;
  hive_id: string;
  name?: string;
  status: string;
  species?: string;
  location?: string;
}

const initialHive = {
  hive_id: "",
  name: "",
  status: "Normal",
  species: "",
  location: "",
};

export default function HiveList() {
  const navigate = useNavigate();
  const [hives, setHives] = useState<Hive[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [query, setQuery] = useState("");
  const [newHive, setNewHive] = useState(initialHive);
  const userRole = authStorage.getUserRole();

  const loadHives = () => {
    hiveService.getAll().then((res) => setHives(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadHives();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    hiveService
      .create(newHive)
      .then(() => {
        setShowForm(false);
        setNewHive(initialHive);
        loadHives();
      })
      .catch((error) => alert(error.response?.data?.detail || "เกิดข้อผิดพลาดในการเพิ่มรัง"));
  };

  const handleDelete = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (window.confirm("ลบรังนี้ใช่หรือไม่")) {
      hiveService.delete(id).then(loadHives);
    }
  };

  const filteredHives = hives.filter((hive) =>
    [hive.hive_id, hive.name, hive.species, hive.location, hive.status]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="page-shell space-y-6 md:space-y-10 pb-10">
      <section className="grid gap-5 lg:grid-cols-[1fr_0.88fr]">
        <Card className="overflow-hidden border-none bg-stone-900 text-white rounded-[2.5rem] shadow-2xl">
          <CardContent className="relative p-8 md:p-12">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
            <h1 className="text-5xl font-black leading-none md:text-7xl">จัดการรัง</h1>
            <p className="mt-4 text-stone-400 text-lg md:text-xl">ดูแลและติดตามสถานะรังผึ้งชันโรงทั้งหมดในฟาร์ม</p>

            <div className="mt-10 flex flex-wrap gap-3">
              {userRole === "admin" && (
                <Button size="lg" className="h-14 rounded-2xl bg-amber-500 px-8 text-lg font-black hover:bg-amber-600 shadow-lg shadow-amber-500/20" onClick={() => setShowForm(true)} data-testid="open-add-hive-dialog">
                  <Plus className="mr-2 h-6 w-6" />
                  เพิ่มรัง
                </Button>
              )}
              <Button
                size="lg"
                variant="secondary"
                className="h-14 rounded-2xl bg-white text-stone-900 px-8 text-lg font-black hover:bg-stone-100"
                onClick={() => setShowScanner(true)}
              >
                <QrCode className="mr-2 h-6 w-6" />
                สแกน QR
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-2xl shadow-stone-200/50 rounded-[2.5rem]">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black">สรุปภาพรวม</h2>
               <div className="rounded-2xl bg-stone-100 px-4 py-2 text-lg font-black text-stone-600">{hives.length} รัง</div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-stone-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหารหัสรัง, ชื่อ, สายพันธุ์..."
                className="h-16 rounded-[1.5rem] border-none bg-stone-50 pl-14 text-lg font-medium focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHives.map((hive) => (
          <Card
            key={hive.id}
            className="group cursor-pointer border-none bg-white transition-all duration-300 rounded-[2.5rem] shadow-xl shadow-stone-200/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10"
            onClick={() => navigate(`/hives/${hive.hive_id}`)}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Hive ID</p>
                  <h3 className="text-3xl font-black text-stone-900">{hive.hive_id}</h3>
                  <p className="text-lg font-bold text-stone-500">{hive.name || "Unnamed Hive"}</p>
                </div>
                <StatusBadge status={hive.status} />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-stone-50 p-5 transition-colors group-hover:bg-amber-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">สายพันธุ์</p>
                  <p className="mt-2 text-lg font-black text-stone-800 truncate">{hive.species || "-"}</p>
                </div>
                <div className="rounded-3xl bg-stone-50 p-5 transition-colors group-hover:bg-lime-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">ตำแหน่ง</p>
                  <p className="mt-2 text-lg font-black text-stone-800 truncate">{hive.location || "-"}</p>
                </div>
              </div>

              {userRole === "admin" && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600" 
                    onClick={(event) => handleDelete(hive.hive_id, event)}
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      {filteredHives.length === 0 && (
        <div className="py-20 text-center space-y-4">
           <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-300">
              <Bug className="h-10 w-10" />
           </div>
           <p className="text-xl font-bold text-stone-400">ไม่พบข้อมูลรังที่ค้นหา</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-black">เพิ่มรังใหม่</DialogTitle>
            <DialogDescription className="text-lg">ระบุรายละเอียดเบื้องต้นของรังชันโรง</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6" data-testid="add-hive-form">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-stone-500 ml-1">รหัสรัง</label>
                <Input
                  className="h-14 rounded-2xl text-lg font-bold bg-stone-50 border-none"
                  value={newHive.hive_id}
                  onChange={(event) => setNewHive({ ...newHive, hive_id: event.target.value })}
                  placeholder="HIVE-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-stone-500 ml-1">ชื่อรัง</label>
                <Input
                  className="h-14 rounded-2xl text-lg font-bold bg-stone-50 border-none"
                  value={newHive.name}
                  onChange={(event) => setNewHive({ ...newHive, name: event.target.value })}
                  placeholder="สวนหน้าบ้าน"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-stone-500 ml-1">สถานะเริ่มต้น</label>
              <select
                className="flex h-14 w-full rounded-2xl bg-stone-50 px-4 py-2 text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newHive.status}
                onChange={(event) => setNewHive({ ...newHive, status: event.target.value })}
              >
                <option value="Strong">แข็งแรง</option>
                <option value="Normal">ปกติ</option>
                <option value="Weak">อ่อนแอ</option>
                <option value="Empty">ว่าง</option>
              </select>
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl text-lg font-bold" onClick={() => setShowForm(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" className="h-14 flex-1 rounded-2xl text-lg font-black bg-stone-900 shadow-xl shadow-stone-200">
                บันทึกรัง
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && <QRScanner onScan={(data) => navigate(`/hives/${data}`)} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
