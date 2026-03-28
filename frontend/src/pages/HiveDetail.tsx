import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, ClipboardList, Droplets, MapPin, Sprout } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { BASE_URL, harvestService, hiveService, inspectionService } from "@/services/api";

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

export default function HiveDetail() {
  const { hive_id } = useParams<{ hive_id: string }>();
  const navigate = useNavigate();
  const [hive, setHive] = useState<HiveDetailData | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newLog, setNewLog] = useState({ honey_yield_ml: 0, propolis_yield_g: 0 });
  const [newNote, setNewNote] = useState({ notes: "", status: "", image: null as File | null });

  const loadData = () => {
    if (!hive_id) return;

    hiveService
      .getById(hive_id)
      .then((res) => {
        setHive(res.data);
        return inspectionService.getByHive(res.data.id);
      })
      .then((res) => setInspections(res.data))
      .catch(() => navigate("/hives"));
  };

  useEffect(() => {
    loadData();
  }, [hive_id]);

  const handleLogSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hive) return;

    harvestService.create(hive.id, newLog).then(() => {
      setShowLogForm(false);
      setNewLog({ honey_yield_ml: 0, propolis_yield_g: 0 });
      loadData();
    });
  };

  const handleNoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Loading hive profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <Button variant="ghost" className="pl-0" onClick={() => navigate("/hives")}>
        <ArrowLeft className="h-4 w-4" />
        Back to hives
      </Button>

      <section className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <Card className="overflow-hidden border-amber-100 bg-[linear-gradient(140deg,rgba(255,251,235,0.96),rgba(255,237,213,0.92),rgba(254,215,170,0.78))]">
          <CardContent className="relative p-6 md:p-8">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/50 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-700">Hive profile</p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold text-stone-900 md:text-5xl">{hive.hive_id}</h1>
                <p className="mt-3 text-base text-stone-700">{hive.name || "Unnamed hive"}</p>
              </div>
              <StatusBadge status={hive.status} />
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <Sprout className="h-4 w-4 text-lime-700" />
                  Species
                </div>
                <p className="mt-3 text-lg font-semibold text-stone-900">{hive.species || "-"}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Location
                </div>
                <p className="mt-3 text-lg font-semibold text-stone-900">{hive.location || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader>
            <CardDescription className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Quick actions
            </CardDescription>
            <CardTitle>บันทึกงานภาคสนาม</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="justify-start" onClick={() => setShowLogForm(true)}>
              <Droplets className="h-4 w-4" />
              Record harvest
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => setShowNoteForm(true)}>
              <ClipboardList className="h-4 w-4" />
              Add inspection note
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Inspection timeline
            </CardDescription>
            <CardTitle>บันทึกการตรวจรัง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspections.length > 0 ? (
              inspections.map((inspection) => (
                <article key={inspection.id} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white/90">
                  {inspection.image_url && (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <img
                        src={`${BASE_URL}${inspection.image_url}`}
                        alt="Inspection"
                        className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
                        {new Date(inspection.inspection_date).toLocaleDateString()}
                      </p>
                      {inspection.hive_status && <StatusBadge status={inspection.hive_status} />}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-stone-600">{inspection.notes || "No notes recorded."}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-stone-500">
                ยังไม่มี inspection record
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Harvest history
            </CardDescription>
            <CardTitle>ประวัติผลผลิต</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hive.harvests && hive.harvests.length > 0 ? (
              hive.harvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-amber-100 bg-amber-50/55 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-white p-3 text-amber-600 shadow-sm">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-stone-900">
                        {new Date(harvest.harvest_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        {new Date(harvest.harvest_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-amber-700">{harvest.honey_yield_ml} ml</p>
                    <p className="text-xs text-stone-500">{harvest.propolis_yield_g} g propolis</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-stone-500">
                ยังไม่มีข้อมูลการเก็บผลผลิต
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record harvest</DialogTitle>
            <DialogDescription>เก็บข้อมูลน้ำผึ้งและ propolis เพื่อใช้ติดตามผลผลิตของรังนี้</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Honey (ml)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={newLog.honey_yield_ml}
                  onChange={(e) => setNewLog({ ...newLog, honey_yield_ml: Number(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Propolis (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={newLog.propolis_yield_g}
                  onChange={(e) => setNewLog({ ...newLog, propolis_yield_g: Number(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowLogForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Save record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inspection note</DialogTitle>
            <DialogDescription>แนบสถานะ ข้อสังเกต และรูปภาพจากการตรวจรัง</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Hive status</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-[hsl(var(--input))] bg-white/90 px-4 py-2 text-sm text-stone-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={newNote.status}
                onChange={(e) => setNewNote({ ...newNote, status: e.target.value })}
              >
                <option value="">Keep current status</option>
                <option value="Strong">Strong</option>
                <option value="Normal">Normal</option>
                <option value="Weak">Weak</option>
                <option value="Empty">Empty</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Notes</label>
              <Textarea
                value={newNote.notes}
                onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                placeholder="เช่น พบการสร้างโพรงดีขึ้น มีเกสรสะสมมากขึ้น"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setNewNote({ ...newNote, image: e.target.files?.[0] ?? null })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowNoteForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Camera className="h-4 w-4" />
                Save inspection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
