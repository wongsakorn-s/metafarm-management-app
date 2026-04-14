import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Bug, MapPin, Plus, QrCode, Search, Sprout, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import QRScanner from "@/components/QRScanner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const statusLabelMap: Record<string, string> = {
  Strong: "แข็งแรง",
  Normal: "ปกติ",
  Weak: "อ่อนแอ",
  Empty: "ว่าง",
};

function getErrorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError(error) ? error.response?.data?.detail || fallback : fallback;
}

export default function HiveList() {
  const navigate = useNavigate();
  const [hives, setHives] = useState<Hive[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [query, setQuery] = useState("");
  const [newHive, setNewHive] = useState(initialHive);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const userRole = authStorage.getUserRole();

  const loadHives = () => {
    hiveService
      .getAll()
      .then((res) => {
        setHives(res.data);
        setLoadError("");
      })
      .catch((error: unknown) => {
        setLoadError(getErrorMessage(error, "โหลดข้อมูลรังไม่สำเร็จ"));
      });
  };

  useEffect(() => {
    loadHives();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    hiveService
      .create(newHive)
      .then(() => {
        setShowForm(false);
        setNewHive(initialHive);
        loadHives();
      })
      .catch((error: unknown) => {
        setFormError(getErrorMessage(error, "บันทึกรังไม่สำเร็จ"));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLoadError("");
    if (!window.confirm("ต้องการลบรังนี้ใช่หรือไม่")) {
      return;
    }

    setIsDeletingId(id);
    hiveService
      .delete(id)
      .then(loadHives)
      .catch((error: unknown) => {
        setLoadError(getErrorMessage(error, "ลบรังไม่สำเร็จ"));
      })
      .finally(() => setIsDeletingId(null));
  };

  const filteredHives = useMemo(
    () =>
      hives.filter((hive) =>
        [hive.hive_id, hive.name, hive.species, hive.location, hive.status]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query.toLowerCase()))
      ),
    [hives, query]
  );

  const attentionCount = useMemo(
    () => hives.filter((hive) => hive.status === "Weak" || hive.status === "Empty").length,
    [hives]
  );

  return (
    <div className="page-shell space-y-6 pb-10 md:space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden rounded-[2.5rem] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] shadow-2xl shadow-amber-100/40">
          <CardContent className="relative p-7 md:p-9">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-bold uppercase text-amber-800">
                <Bug className="h-4 w-4" />
                Hive Management
              </div>
              <h1 className="mt-5 text-4xl font-black leading-none text-stone-900 md:text-6xl">
                จัดการรังชันโรง
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                ดูรายการรังทั้งหมด ค้นหาได้รวดเร็ว และเข้าไปดูรายละเอียดของแต่ละรังได้ทันที
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {userRole === "admin" && (
                  <Button
                    size="lg"
                    className="h-14 rounded-2xl bg-amber-500 px-7 text-base font-black text-white shadow-lg shadow-amber-200 hover:bg-amber-600"
                    onClick={() => {
                      setShowForm(true);
                      setFormError("");
                    }}
                    data-testid="open-add-hive-dialog"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    เพิ่มรัง
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 rounded-2xl bg-stone-900 px-7 text-base font-black text-white hover:bg-stone-800"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  สแกน QR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none bg-white shadow-2xl shadow-stone-200/50">
          <CardContent className="p-7 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(180deg,#fff7e6,#ffefbf)] p-5 text-stone-900">
                <p className="text-xs font-bold uppercase text-amber-800">รังทั้งหมด</p>
                <p className="mt-3 text-4xl font-black">{hives.length}</p>
                <p className="mt-2 text-sm text-stone-600">พร้อมใช้งานในระบบ</p>
              </div>
              <div className="rounded-[1.75rem] border border-lime-100 bg-[linear-gradient(180deg,#f7fde8,#edf8c9)] p-5 text-stone-900">
                <p className="text-xs font-bold uppercase text-lime-800">ต้องติดตาม</p>
                <p className="mt-3 text-4xl font-black">{attentionCount}</p>
                <p className="mt-2 text-sm text-stone-600">รังอ่อนแอหรือว่าง</p>
              </div>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหารหัสรัง ชื่อรัง สายพันธุ์ หรือตำแหน่ง"
                className="h-14 rounded-[1.5rem] border border-stone-200 bg-white pl-14 text-base font-medium focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {loadError ? (
        <Card className="rounded-[2rem] border border-red-200 bg-red-50 shadow-none">
          <CardContent className="px-5 py-4 text-sm font-semibold text-red-700">{loadError}</CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredHives.map((hive) => (
          <Card
            key={hive.id}
            className="group cursor-pointer overflow-hidden rounded-[2.25rem] border-none bg-white shadow-xl shadow-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-100/70"
            onClick={() => navigate(`/hives/${hive.hive_id}`)}
          >
            <CardContent className="p-0">
              <div className="border-b border-stone-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.85),rgba(255,255,255,0.96))] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase text-amber-700">Hive ID</p>
                    <h3 className="mt-2 truncate text-3xl font-black text-stone-900">{hive.hive_id}</h3>
                    <p className="mt-1 truncate text-base font-semibold text-stone-500">
                      {hive.name || "ยังไม่ได้ตั้งชื่อรัง"}
                    </p>
                  </div>
                  <StatusBadge status={hive.status} />
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.5rem] bg-stone-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-stone-400">
                      <Sprout className="h-4 w-4 text-amber-600" />
                      สายพันธุ์
                    </div>
                    <p className="mt-3 min-h-[3.5rem] break-words text-base font-black leading-7 text-stone-900">
                      {hive.species || "-"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-stone-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-stone-400">
                      <MapPin className="h-4 w-4 text-lime-700" />
                      ตำแหน่ง
                    </div>
                    <p className="mt-3 min-h-[3.5rem] break-words text-base font-black leading-7 text-stone-900">
                      {hive.location || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-[1.5rem] bg-amber-50 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-amber-700">สถานะ</p>
                    <p className="mt-1 text-sm font-semibold text-stone-700">
                      {statusLabelMap[hive.status] || hive.status}
                    </p>
                  </div>
                  <p className="text-xs font-bold uppercase text-stone-500">รายละเอียด</p>
                </div>

                {userRole === "admin" && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600"
                      onClick={(event) => handleDelete(hive.hive_id, event)}
                      disabled={isDeletingId === hive.hive_id}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {filteredHives.length === 0 && (
        <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-stone-200/40">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-300">
              <Bug className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-stone-900">ไม่พบรังที่ตรงกับคำค้นหา</h3>
              <p className="mt-2 text-base text-stone-500">ลองค้นหาด้วยคำอื่น หรือเคลียร์คำค้นหาแล้วดูอีกครั้ง</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-black">เพิ่มรังใหม่</DialogTitle>
            <DialogDescription className="text-lg">ระบุรายละเอียดเบื้องต้นของรังชันโรง</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6" data-testid="add-hive-form">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-black uppercase text-stone-500">รหัสรัง</label>
                <Input
                  className="modal-field text-lg font-bold"
                  value={newHive.hive_id}
                  onChange={(event) => setNewHive({ ...newHive, hive_id: event.target.value })}
                  placeholder="HIVE-001"
                  required
                  data-testid="add-hive-id"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-sm font-black uppercase text-stone-500">ชื่อรัง</label>
                <Input
                  className="modal-field text-lg font-bold"
                  value={newHive.name}
                  onChange={(event) => setNewHive({ ...newHive, name: event.target.value })}
                  data-testid="add-hive-name"
                  placeholder="สวนหน้าบ้าน"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-black uppercase text-stone-500">สายพันธุ์</label>
                <Input
                  className="modal-field text-lg font-bold"
                  value={newHive.species}
                  onChange={(event) => setNewHive({ ...newHive, species: event.target.value })}
                  placeholder="Tetragonula"
                  data-testid="add-hive-species"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-sm font-black uppercase text-stone-500">ตำแหน่ง</label>
                <Input
                  className="modal-field text-lg font-bold"
                  value={newHive.location}
                  onChange={(event) => setNewHive({ ...newHive, location: event.target.value })}
                  placeholder="Zone A"
                  data-testid="add-hive-location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-500">สถานะเริ่มต้น</label>
              <select
                className="modal-select text-lg font-bold"
                value={newHive.status}
                onChange={(event) => setNewHive({ ...newHive, status: event.target.value })}
              >
                <option value="Strong">แข็งแรง</option>
                <option value="Normal">ปกติ</option>
                <option value="Weak">อ่อนแอ</option>
                <option value="Empty">ว่าง</option>
              </select>
            </div>

            {formError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {formError}
              </div>
            ) : null}

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="h-14 flex-1 rounded-2xl text-lg font-bold"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="h-14 flex-1 rounded-2xl bg-stone-900 text-lg font-black shadow-xl shadow-stone-200"
                data-testid="submit-add-hive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกรัง"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && <QRScanner onScan={(data) => navigate(`/hives/${data}`)} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
