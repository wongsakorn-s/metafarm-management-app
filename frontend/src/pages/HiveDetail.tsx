import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  ClipboardList,
  Droplets,
  MapPin,
  Sprout,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authStorage, BASE_URL, harvestService, hiveService, inspectionService } from "@/services/api";

interface Harvest {
  id: number;
  harvest_date: string;
  honey_yield_ml: number;
  propolis_yield_g: number;
}

interface HiveDetailData {
  id: number;
  hive_id: string;
  name?: string;
  status: string;
  species?: string;
  location?: string;
  harvests?: Harvest[];
}

interface Inspection {
  id: number;
  inspection_date: string;
  notes?: string;
  hive_status?: string;
  image_url?: string;
}

function resolveInspectionImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${BASE_URL}${imageUrl}`;
}

function formatDisplayDate(date: string) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDisplayTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HiveDetail() {
  const { hive_id } = useParams<{ hive_id: string }>();
  const navigate = useNavigate();
  const [hive, setHive] = useState<HiveDetailData | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newLog, setNewLog] = useState({ honey_yield_ml: 0, propolis_yield_g: 0 });
  const [newNote, setNewNote] = useState({ notes: "", status: "", image: null as File | null });
  const userRole = authStorage.getUserRole();

  const loadData = () => {
    if (!hive_id) return;

    hiveService
      .getById(hive_id)
      .then((response) => {
        setHive(response.data);
        return inspectionService.getByHive(response.data.id);
      })
      .then((response) => setInspections(response.data))
      .catch(() => navigate("/hives"));
  };

  useEffect(() => {
    loadData();
  }, [hive_id]);

  const handleLogSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hive) return;

    harvestService.create(hive.id, newLog).then(() => {
      setShowLogForm(false);
      setNewLog({ honey_yield_ml: 0, propolis_yield_g: 0 });
      loadData();
    });
  };

  const handleNoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hive) return;

    const formData = new FormData();
    formData.append("hive_id_int", hive.id.toString());
    formData.append("notes", newNote.notes);
    if (newNote.status) formData.append("status", newNote.status);
    if (newNote.image) formData.append("image", newNote.image);

    inspectionService.create(formData).then(() => {
      setShowNoteForm(false);
      setNewNote({ notes: "", status: "", image: null });
      loadData();
    });
  };

  const totalHoney = useMemo(
    () => hive?.harvests?.reduce((sum, harvest) => sum + harvest.honey_yield_ml, 0) ?? 0,
    [hive]
  );

  const totalPropolis = useMemo(
    () => hive?.harvests?.reduce((sum, harvest) => sum + harvest.propolis_yield_g, 0) ?? 0,
    [hive]
  );

  if (!hive) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="mt-6 text-lg font-black uppercase text-amber-700">กำลังโหลดข้อมูล</p>
        </div>
      </div>
    );
  }

  const canEdit = userRole === "admin" || userRole === "operator";

  return (
    <div className="page-shell space-y-6 pb-10 md:space-y-8">
      <Button variant="ghost" className="pl-0 text-lg font-bold hover:bg-transparent" onClick={() => navigate("/hives")}>
        <ArrowLeft className="mr-2 h-5 w-5" />
        กลับหน้ารายการ
      </Button>

      <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <Card className="overflow-hidden rounded-[2.5rem] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] shadow-2xl shadow-amber-100/40">
          <CardContent className="relative p-8 md:p-10">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase text-amber-700">รหัสรัง</p>
                  <h1 className="text-5xl font-black leading-none text-stone-900 md:text-7xl">{hive.hive_id}</h1>
                  <p className="text-2xl font-bold text-stone-500 md:text-3xl">{hive.name || "ยังไม่ได้ตั้งชื่อรัง"}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <StatusBadge status={hive.status} />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(180deg,#fff8e8,#fff1c9)] p-5 text-stone-900 shadow-lg shadow-amber-100/40">
                  <p className="text-xs font-bold uppercase text-amber-700">ผลผลิตน้ำผึ้ง</p>
                  <p className="mt-3 text-3xl font-black">{totalHoney}</p>
                  <p className="mt-1 text-sm text-stone-600">มล. สะสม</p>
                </div>
                <div className="rounded-[1.75rem] border border-stone-100 bg-[linear-gradient(180deg,#ffffff,#f8f7f4)] p-5 text-stone-900 shadow-lg shadow-stone-200/30">
                  <p className="text-xs font-bold uppercase text-stone-500">โพรโพลิส</p>
                  <p className="mt-3 text-3xl font-black">{totalPropolis}</p>
                  <p className="mt-1 text-sm text-stone-500">กรัม สะสม</p>
                </div>
                <div className="rounded-[1.75rem] border border-lime-100 bg-[linear-gradient(180deg,#f8fde9,#eef8d2)] p-5 text-stone-900 shadow-lg shadow-lime-100/50">
                  <p className="text-xs font-bold uppercase text-lime-800">บันทึกตรวจ</p>
                  <p className="mt-3 text-3xl font-black">{inspections.length}</p>
                  <p className="mt-1 text-sm text-stone-500">รายการล่าสุด</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[2rem] border border-stone-100 bg-[linear-gradient(180deg,#ffffff,#fcfbf8)] p-6 shadow-lg shadow-stone-200/30">
                  <div className="flex items-center gap-3 text-sm font-black uppercase text-stone-400">
                    <Sprout className="h-5 w-5 text-lime-600" />
                    สายพันธุ์
                  </div>
                  <p className="mt-4 text-2xl font-black leading-tight text-stone-800">{hive.species || "-"}</p>
                </div>
                <div className="rounded-[2rem] border border-stone-100 bg-[linear-gradient(180deg,#ffffff,#fcfbf8)] p-6 shadow-lg shadow-stone-200/30">
                  <div className="flex items-center gap-3 text-sm font-black uppercase text-stone-400">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    ตำแหน่ง
                  </div>
                  <p className="mt-4 text-2xl font-black leading-tight text-stone-800">{hive.location || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <Card className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#ffffff)] text-stone-900 shadow-2xl shadow-stone-200/40">
            <CardHeader className="p-8 pb-4 md:p-10 md:pb-4">
              <CardTitle className="text-3xl font-black text-amber-600">บันทึกข้อมูลรัง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-8 pt-2 md:p-10 md:pt-2">
              <div className="rounded-[2rem] border border-amber-100 bg-[linear-gradient(180deg,#fff9ee,#fff5dd)] p-4 shadow-lg shadow-amber-100/30">
                <Button
                  className="h-15 w-full justify-start rounded-2xl bg-white text-lg font-black text-amber-700 shadow-sm ring-1 ring-amber-100 hover:bg-amber-50"
                  onClick={() => setShowLogForm(true)}
                  data-testid="open-harvest-dialog"
                >
                  <Droplets className="mr-3 h-6 w-6 text-blue-500" />
                  บันทึกผลผลิต
                </Button>
                <p className="mt-3 text-sm leading-6 text-stone-500">อัปเดตน้ำผึ้งและโพรโพลิสจากรังนี้</p>
              </div>

              <div className="rounded-[2rem] border border-lime-100 bg-[linear-gradient(180deg,#fbfeee,#f2f8df)] p-4 shadow-lg shadow-lime-100/30">
                <Button
                  className="h-15 w-full justify-start rounded-2xl bg-white text-lg font-black text-lime-800 shadow-sm ring-1 ring-lime-100 hover:bg-lime-50"
                  onClick={() => setShowNoteForm(true)}
                  data-testid="open-inspection-dialog"
                >
                  <ClipboardList className="mr-3 h-6 w-6 text-lime-500" />
                  เพิ่มบันทึกการตรวจ
                </Button>
                <p className="mt-3 text-sm leading-6 text-stone-500">จดสถานะล่าสุด พร้อมแนบภาพประกอบได้</p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="px-2">
            <h2 className="text-3xl font-black text-stone-900">บันทึกการตรวจรัง</h2>
            <p className="mt-1 text-stone-500">ประวัติการตรวจและภาพประกอบล่าสุดของรังนี้</p>
          </div>

          <div className="space-y-4">
            {inspections.length > 0 ? (
              inspections.map((inspection) => (
                <article key={inspection.id} className="overflow-hidden rounded-[2.25rem] border border-stone-100 bg-white shadow-xl shadow-stone-200/35">
                  {resolveInspectionImageUrl(inspection.image_url) && (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <img
                        src={resolveInspectionImageUrl(inspection.image_url)}
                        alt="Inspection"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-4 p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-amber-700">{formatDisplayDate(inspection.inspection_date)}</p>
                        <p className="text-sm font-semibold text-stone-400">{formatDisplayTime(inspection.inspection_date)}</p>
                      </div>
                      {inspection.hive_status && <StatusBadge status={inspection.hive_status} />}
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-50 px-5 py-4">
                      <p className="text-lg leading-8 text-stone-600">{inspection.notes || "-"}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-white/70 p-12 text-center text-lg font-bold text-stone-400">
                ยังไม่มีบันทึกการตรวจ
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="px-2">
            <h2 className="text-3xl font-black text-stone-900">ประวัติผลผลิต</h2>
            <p className="mt-1 text-stone-500">ดูข้อมูลผลผลิตของรังนี้แบบย้อนหลัง</p>
          </div>

          <div className="space-y-4">
            {hive.harvests && hive.harvests.length > 0 ? (
              hive.harvests.map((harvest) => (
                <div key={harvest.id} className="rounded-[2.25rem] border border-stone-100 bg-white p-6 shadow-xl shadow-stone-200/35 transition-all hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Droplets className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-stone-900">{formatDisplayDate(harvest.harvest_date)}</p>
                        <p className="text-sm font-bold uppercase text-stone-400">
                          {formatDisplayTime(harvest.harvest_date)}
                        </p>
                      </div>
                    </div>

                    <div className="grid min-w-[112px] gap-2 text-right">
                      <div className="rounded-2xl bg-[linear-gradient(180deg,#fff8e8,#fff1cf)] px-4 py-2">
                        <p className="text-xs font-bold uppercase text-amber-700">น้ำผึ้ง</p>
                        <p className="mt-1 text-xl font-black text-stone-900">{harvest.honey_yield_ml} ml</p>
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(180deg,#ffffff,#f7f6f2)] px-4 py-2">
                        <p className="text-xs font-bold uppercase text-stone-500">โพรโพลิส</p>
                        <p className="mt-1 text-lg font-black text-stone-900">{harvest.propolis_yield_g} g</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-white/70 p-12 text-center text-lg font-bold text-stone-400">
                ยังไม่มีข้อมูลผลผลิต
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">บันทึกผลผลิต</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogSubmit} className="mt-4 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-black uppercase text-stone-500">น้ำผึ้ง (ml)</label>
                <Input
                  className="modal-field text-xl font-bold"
                  type="number"
                  step="0.1"
                  value={newLog.honey_yield_ml}
                  onChange={(e) => setNewLog({ ...newLog, honey_yield_ml: Number(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-sm font-black uppercase text-stone-500">โพรโพลิส (g)</label>
                <Input
                  className="modal-field text-xl font-bold"
                  type="number"
                  step="0.1"
                  value={newLog.propolis_yield_g}
                  onChange={(e) => setNewLog({ ...newLog, propolis_yield_g: Number(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setShowLogForm(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" className="h-14 flex-1 rounded-2xl bg-stone-900 text-lg font-black">
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">บันทึกการตรวจ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="mt-4 space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-500">สถานะรัง</label>
              <select className="modal-select text-xl font-bold" value={newNote.status} onChange={(e) => setNewNote({ ...newNote, status: e.target.value })}>
                <option value="">คงสถานะเดิม</option>
                <option value="Strong">แข็งแรง</option>
                <option value="Normal">ปกติ</option>
                <option value="Weak">อ่อนแอ</option>
                <option value="Empty">ว่าง</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-500">บันทึกเพิ่มเติม</label>
              <Textarea
                className="modal-textarea text-lg font-medium"
                value={newNote.notes}
                onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-500">รูปภาพประกอบ</label>
              <Input
                className="modal-field pt-3"
                type="file"
                accept="image/*"
                onChange={(e) => setNewNote({ ...newNote, image: e.target.files?.[0] ?? null })}
              />
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setShowNoteForm(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" className="h-14 flex-1 rounded-2xl bg-stone-900 text-lg font-black">
                <Camera className="mr-2 h-5 w-5" />
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
