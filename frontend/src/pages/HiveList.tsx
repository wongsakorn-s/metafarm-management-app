import { useEffect, useState } from "react";
import { Plus, QrCode, Search, Trash2 } from "lucide-react";
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
    <div className="page-shell space-y-5 md:space-y-6">
      <section className="grid gap-4 md:gap-5 lg:grid-cols-[1fr_0.88fr]">
        <Card className="overflow-hidden border-amber-100 bg-[linear-gradient(135deg,rgba(28,25,23,0.95),rgba(120,53,15,0.9),rgba(245,158,11,0.82))] text-white">
          <CardContent className="relative p-5 md:p-8">
            <div className="pointer-events-none absolute -right-10 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-amber-200/20 blur-3xl md:h-48 md:w-48" />
            <h1 className="mt-3 text-[2.35rem] font-semibold leading-[0.98] md:mt-4 md:text-5xl">จัดการรังทั้งหมด</h1>

            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8 md:gap-3">
              {userRole === "admin" && (
                <Button size="sm" className="h-10 px-4 md:h-11 md:px-5" onClick={() => setShowForm(true)} data-testid="open-add-hive-dialog">
                  <Plus className="h-4 w-4" />
                  เพิ่มรัง
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="h-10 px-4 md:h-11 md:px-5"
                onClick={() => setShowScanner(true)}
              >
                <QrCode className="h-4 w-4" />
                สแกน QR
              </Button>
              <Button size="sm" variant="outline" className="h-10 px-4 md:h-11 md:px-5" onClick={() => navigate("/print-qr")}>
                พิมพ์ป้าย
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-lime-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,250,236,0.92))]">
          <CardHeader className="p-5 pb-4 md:p-6 md:pb-4">
            <CardTitle className="text-[1.9rem] leading-none md:text-2xl">จำนวนรัง {hives.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0 md:p-6 md:pt-0">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "Strong", label: "แข็งแรง" },
                { value: "Normal", label: "ปกติ" },
                { value: "Weak", label: "อ่อนแอ" },
                { value: "Empty", label: "ว่าง" },
              ].map((status) => (
                <div key={status.value} className="rounded-[1.25rem] bg-white p-3.5 shadow-sm md:rounded-[1.5rem] md:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 md:text-xs md:tracking-[0.24em]">
                    {status.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900 md:mt-3 md:text-3xl">
                    {hives.filter((hive) => hive.status === status.value).length}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาจากรหัสรัง ชื่อ สายพันธุ์ หรือพื้นที่"
                className="h-10 pl-11 md:h-11"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredHives.map((hive) => (
          <Card
            key={hive.id}
            className="cursor-pointer border-stone-200/80 transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(41,37,36,0.45)]"
            onClick={() => navigate(`/hives/${hive.hive_id}`)}
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">รหัสรัง</p>
                  <h3 className="mt-2 truncate text-2xl font-semibold text-stone-900">{hive.hive_id}</h3>
                  <p className="mt-2 truncate text-sm text-stone-600">{hive.name || "ยังไม่ได้ตั้งชื่อ"}</p>
                </div>
                <StatusBadge status={hive.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:mt-6">
                <div className="rounded-2xl bg-amber-50/80 p-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">สายพันธุ์</p>
                  <p className="mt-2 truncate font-semibold text-stone-900">{hive.species || "-"}</p>
                </div>
                <div className="rounded-2xl bg-lime-50/80 p-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">ตำแหน่ง</p>
                  <p className="mt-2 truncate font-semibold text-stone-900">{hive.location || "-"}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end md:mt-5">
                {userRole === "admin" && (
                  <Button variant="ghost" size="icon" onClick={(event) => handleDelete(hive.hive_id, event)} aria-label={`ลบ ${hive.hive_id}`}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {filteredHives.length === 0 && (
        <Card className="border-dashed border-stone-300">
          <CardContent className="p-8 text-center md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-500">ไม่พบข้อมูลรัง</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogDescription>กรอกข้อมูลรังเพื่อเพิ่มรายการใหม่เข้าสู่ระบบ</DialogDescription>
            <DialogTitle>เพิ่มรังใหม่</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="add-hive-form">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">รหัสรัง</label>
                <Input
                  data-testid="add-hive-id"
                  value={newHive.hive_id}
                  onChange={(event) => setNewHive({ ...newHive, hive_id: event.target.value })}
                  placeholder="HIVE-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">ชื่อรัง</label>
                <Input
                  data-testid="add-hive-name"
                  value={newHive.name}
                  onChange={(event) => setNewHive({ ...newHive, name: event.target.value })}
                  placeholder="สวนด้านเหนือ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">สายพันธุ์</label>
                <Input
                  data-testid="add-hive-species"
                  value={newHive.species}
                  onChange={(event) => setNewHive({ ...newHive, species: event.target.value })}
                  placeholder="ชันโรงขนเงิน"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">ตำแหน่ง</label>
                <Input
                  data-testid="add-hive-location"
                  value={newHive.location}
                  onChange={(event) => setNewHive({ ...newHive, location: event.target.value })}
                  placeholder="โซน B"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">สถานะ</label>
              <select
                data-testid="add-hive-status"
                className="flex h-11 w-full rounded-2xl border border-[hsl(var(--input))] bg-white/90 px-4 py-2 text-sm text-stone-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={newHive.status}
                onChange={(event) => setNewHive({ ...newHive, status: event.target.value })}
              >
                <option value="Strong">แข็งแรง</option>
                <option value="Normal">ปกติ</option>
                <option value="Weak">อ่อนแอ</option>
                <option value="Empty">ว่าง</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" data-testid="submit-add-hive">
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
