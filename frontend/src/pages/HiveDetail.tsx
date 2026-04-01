import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, ClipboardList, Droplets, MapPin, Sprout } from "lucide-react";

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

  if (!hive) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="mt-6 text-lg font-black uppercase tracking-[0.2em] text-amber-700">กำลังโหลดข้อมูล</p>
        </div>
      </div>
    );
  }

  const canEdit = userRole === "admin" || userRole === "operator";

  return (
    <div className="page-shell space-y-6 md:space-y-10 pb-10">
      <Button variant="ghost" className="pl-0 text-lg font-bold hover:bg-transparent" onClick={() => navigate("/hives")}>
        <ArrowLeft className="mr-2 h-5 w-5" />
        กลับหน้ารายการ
      </Button>

      <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <Card className="overflow-hidden border-none bg-white shadow-2xl shadow-stone-200/50 rounded-[2.5rem]">
          <CardContent className="relative p-8 md:p-12">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-50 blur-3xl" />
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-600">รหัสรังผึ้ง</p>
                <h1 className="text-5xl font-black text-stone-900 md:text-7xl">{hive.hive_id}</h1>
                <p className="text-2xl font-bold text-stone-500">{hive.name || "ยังไม่ได้ตั้งชื่อ"}</p>
              </div>
              <div className="scale-125 origin-top-right">
                <StatusBadge status={hive.status} />
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] bg-stone-50 p-6 border border-stone-100">
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wider text-stone-400 mb-4">
                  <Sprout className="h-5 w-5 text-lime-600" />
                  สายพันธุ์
                </div>
                <p className="text-2xl font-black text-stone-800">{hive.species || "-"}</p>
              </div>
              <div className="rounded-[2rem] bg-stone-50 p-6 border border-stone-100">
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wider text-stone-400 mb-4">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  ตำแหน่ง
                </div>
                <p className="text-2xl font-black text-stone-800">{hive.location || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <Card className="border-none bg-stone-900 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 md:p-12 pb-4">
              <CardTitle className="text-2xl font-black uppercase tracking-wider text-amber-500">บันทึกข้อมูลรัง</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0 grid gap-4">
              <Button className="h-16 justify-start rounded-2xl bg-white text-stone-900 text-xl font-black hover:bg-stone-100" onClick={() => setShowLogForm(true)} data-testid="open-harvest-dialog">
                <Droplets className="mr-3 h-6 w-6 text-blue-500" />
                บันทึกผลผลิต
              </Button>
              <Button className="h-16 justify-start rounded-2xl bg-white/10 text-white text-xl font-black hover:bg-white/20 border border-white/10" onClick={() => setShowNoteForm(true)} data-testid="open-inspection-dialog">
                <ClipboardList className="mr-3 h-6 w-6 text-lime-400" />
                เพิ่มบันทึกการตรวจ
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-3xl font-black px-2">บันทึกการตรวจรัง</h2>
          <div className="space-y-4">
            {inspections.length > 0 ? (
              inspections.map((inspection) => (
                <article key={inspection.id} className="overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-stone-200/40 border border-stone-100">
                  {resolveInspectionImageUrl(inspection.image_url) && (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <img
                        src={resolveInspectionImageUrl(inspection.image_url)}
                        alt="Inspection"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black text-amber-600">
                        {new Date(inspection.inspection_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {inspection.hive_status && <StatusBadge status={inspection.hive_status} />}
                    </div>
                    <p className="text-xl leading-relaxed text-stone-600">{inspection.notes || "-"}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[2.5rem] border-2 border-dashed border-stone-200 p-12 text-center text-xl font-bold text-stone-400">
                ยังไม่มีบันทึกการตรวจ
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black px-2">ประวัติผลผลิต</h2>
          <div className="space-y-4">
            {hive.harvests && hive.harvests.length > 0 ? (
              hive.harvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-center justify-between gap-4 rounded-[2rem] bg-white p-6 shadow-xl shadow-stone-200/40 border border-stone-100 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Droplets className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-stone-900">{new Date(harvest.harvest_date).toLocaleDateString()}</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-stone-400">
                        {new Date(harvest.harvest_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-600">{harvest.honey_yield_ml} ml</p>
                    <p className="text-sm font-bold text-stone-400">{harvest.propolis_yield_g}g Propolis</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2.5rem] border-2 border-dashed border-stone-200 p-12 text-center text-xl font-bold text-stone-400">
                ยังไม่มีข้อมูลผลผลิต
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Forms Refined for Mobile */}
      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">บันทึกผลผลิต</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogSubmit} className="space-y-6 mt-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase text-stone-500 ml-1">น้ำผึ้ง (ml)</label>
                <Input className="h-14 rounded-2xl text-xl font-bold bg-stone-50 border-none" type="number" step="0.1" value={newLog.honey_yield_ml} onChange={(e) => setNewLog({ ...newLog, honey_yield_ml: Number(e.target.value) || 0 })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase text-stone-500 ml-1">โพรโพลิส (g)</label>
                <Input className="h-14 rounded-2xl text-xl font-bold bg-stone-50 border-none" type="number" step="0.1" value={newLog.propolis_yield_g} onChange={(e) => setNewLog({ ...newLog, propolis_yield_g: Number(e.target.value) || 0 })} required />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setShowLogForm(false)}>ยกเลิก</Button>
              <Button type="submit" className="h-14 flex-1 rounded-2xl bg-stone-900 text-lg font-black">บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">บันทึกการตรวจ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase text-stone-500 ml-1">สถานะรัง</label>
              <select className="flex h-14 w-full rounded-2xl bg-stone-50 px-4 py-2 text-xl font-bold border-none" value={newNote.status} onChange={(e) => setNewNote({ ...newNote, status: e.target.value })}>
                <option value="">คงสถานะเดิม</option>
                <option value="Strong">แข็งแรง</option>
                <option value="Normal">ปกติ</option>
                <option value="Weak">อ่อนแอ</option>
                <option value="Empty">ว่าง</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase text-stone-500 ml-1">บันทึกเพิ่มเติม</label>
              <Textarea className="rounded-2xl text-lg font-medium bg-stone-50 border-none min-h-[120px]" value={newNote.notes} onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase text-stone-500 ml-1">รูปภาพประกอบ</label>
              <Input className="h-14 rounded-2xl pt-3 bg-stone-50 border-none" type="file" accept="image/*" onChange={(e) => setNewNote({ ...newNote, image: e.target.files?.[0] ?? null })} />
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setShowNoteForm(false)}>ยกเลิก</Button>
              <Button type="submit" className="h-14 flex-1 rounded-2xl bg-stone-900 text-lg font-black"><Camera className="mr-2 h-5 w-5" />บันทึก</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
