import { useEffect, useState } from "react";
import { Plus, QrCode, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import QRScanner from "@/components/QRScanner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { hiveService } from "@/services/api";

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

  const loadHives = () => {
    hiveService.getAll().then((res) => setHives(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadHives();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    hiveService
      .create(newHive)
      .then(() => {
        setShowForm(false);
        setNewHive(initialHive);
        loadHives();
      })
      .catch((err) => alert(err.response?.data?.detail || "Error creating hive"));
  };

  const handleDelete = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm("Delete this hive?")) {
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100 md:text-xs md:tracking-[0.34em]">
              Hive registry
            </p>
            <h1 className="mt-3 text-[2.35rem] font-semibold leading-[0.98] md:mt-4 md:text-5xl">
              จัดการรังทั้งหมดจากมุมมองเดียว
            </h1>
            <p className="mt-3 max-w-lg text-[13px] leading-6 text-amber-50/90 md:mt-4 md:text-base md:leading-7">
              ออกแบบให้เหมาะกับการใช้งานหน้างาน สามารถเพิ่มรังใหม่ ค้นหา และสแกน QR เพื่อเข้าหน้ารายละเอียดได้ทันที
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8 md:gap-3">
              <Button size="sm" className="h-10 px-4 md:h-11 md:px-5" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Add hive
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 px-4 md:h-11 md:px-5"
                onClick={() => setShowScanner(true)}
              >
                <QrCode className="h-4 w-4" />
                Scan QR
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-4 md:h-11 md:px-5"
                onClick={() => navigate("/print-qr")}
              >
                Print labels
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-lime-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,250,236,0.92))]">
          <CardHeader className="p-5 pb-4 md:p-6 md:pb-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-700 md:tracking-[0.32em]">
              Fleet overview
            </CardDescription>
            <CardTitle className="text-[1.9rem] leading-none md:text-2xl">จำนวนรังทั้งหมด {hives.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0 md:p-6 md:pt-0">
            <div className="grid grid-cols-2 gap-3">
              {["Strong", "Normal", "Weak", "Empty"].map((status) => (
                <div key={status} className="rounded-[1.25rem] bg-white p-3.5 shadow-sm md:rounded-[1.5rem] md:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 md:text-xs md:tracking-[0.24em]">
                    {status}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900 md:mt-3 md:text-3xl">
                    {hives.filter((hive) => hive.status === status).length}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by hive id, name, species or location"
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
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Hive ID</p>
                  <h3 className="mt-2 truncate text-2xl font-semibold text-stone-900">{hive.hive_id}</h3>
                  <p className="mt-2 truncate text-sm text-stone-600">{hive.name || "Unnamed hive"}</p>
                </div>
                <StatusBadge status={hive.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:mt-6">
                <div className="rounded-2xl bg-amber-50/80 p-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Species</p>
                  <p className="mt-2 truncate font-semibold text-stone-900">{hive.species || "-"}</p>
                </div>
                <div className="rounded-2xl bg-lime-50/80 p-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Location</p>
                  <p className="mt-2 truncate font-semibold text-stone-900">{hive.location || "-"}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end md:mt-5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(hive.hive_id, e)}
                  aria-label={`Delete ${hive.hive_id}`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {filteredHives.length === 0 && (
        <Card className="border-dashed border-stone-300">
          <CardContent className="p-8 text-center md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-500">No hives found</p>
            <p className="mt-3 text-sm text-stone-600">ลองเปลี่ยนคำค้นหรือเพิ่มรังใหม่จากปุ่มด้านบน</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new hive</DialogTitle>
            <DialogDescription>บันทึกรหัสรัง สายพันธุ์ และตำแหน่งเพื่อใช้ติดตามภายหลัง</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Hive ID</label>
                <Input
                  value={newHive.hive_id}
                  onChange={(e) => setNewHive({ ...newHive, hive_id: e.target.value })}
                  placeholder="HIVE-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Hive Name</label>
                <Input
                  value={newHive.name}
                  onChange={(e) => setNewHive({ ...newHive, name: e.target.value })}
                  placeholder="North Garden"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Species</label>
                <Input
                  value={newHive.species}
                  onChange={(e) => setNewHive({ ...newHive, species: e.target.value })}
                  placeholder="Tetragonula laeviceps"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Location</label>
                <Input
                  value={newHive.location}
                  onChange={(e) => setNewHive({ ...newHive, location: e.target.value })}
                  placeholder="Zone B"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Status</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-[hsl(var(--input))] bg-white/90 px-4 py-2 text-sm text-stone-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={newHive.status}
                onChange={(e) => setNewHive({ ...newHive, status: e.target.value })}
              >
                <option value="Strong">Strong</option>
                <option value="Normal">Normal</option>
                <option value="Weak">Weak</option>
                <option value="Empty">Empty</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Save hive</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && <QRScanner onScan={(data) => navigate(`/hives/${data}`)} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
