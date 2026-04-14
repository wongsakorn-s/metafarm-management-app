import axios from "axios";
import { useEffect, useState } from "react";
import { Shield, Trash2, User, UserPlus } from "lucide-react";

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
import { userService } from "@/services/api";

interface UserData {
  id: number;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
}

const initialUser = {
  username: "",
  password: "",
  full_name: "",
  role: "operator",
};

function getErrorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError(error) ? error.response?.data?.detail || fallback : fallback;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState(initialUser);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const loadUsers = () => {
    userService
      .getAll()
      .then((res) => {
        setUsers(res.data);
        setLoadError("");
      })
      .catch((error: unknown) => {
        setLoadError(getErrorMessage(error, "โหลดข้อมูลผู้ใช้ไม่สำเร็จ"));
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    userService
      .create(newUser)
      .then(() => {
        setShowForm(false);
        setNewUser(initialUser);
        loadUsers();
      })
      .catch((error: unknown) => {
        setFormError(getErrorMessage(error, "สร้างผู้ใช้งานไม่สำเร็จ"));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("ต้องการลบผู้ใช้งานนี้ใช่หรือไม่")) {
      return;
    }

    setIsDeletingId(id);
    setLoadError("");
    userService
      .delete(id)
      .then(loadUsers)
      .catch((error: unknown) => {
        setLoadError(getErrorMessage(error, "ลบผู้ใช้งานไม่สำเร็จ"));
      })
      .finally(() => setIsDeletingId(null));
  };

  return (
    <div className="page-shell space-y-8 pb-10 md:space-y-12">
      <div className="flex flex-col gap-6 px-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-stone-900 md:text-7xl">จัดการสมาชิก</h1>
          <p className="text-xl font-bold text-stone-500">ควบคุมสิทธิ์และบัญชีผู้ใช้งานภายในระบบ</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setFormError("");
          }}
          className="h-16 rounded-[2rem] bg-amber-500 px-8 text-xl font-black shadow-xl shadow-amber-200 hover:bg-amber-600"
        >
          <UserPlus className="mr-3 h-6 w-6" />
          เพิ่มสมาชิกใหม่
        </Button>
      </div>

      {loadError ? (
        <Card className="rounded-[2rem] border border-red-200 bg-red-50 shadow-none">
          <CardContent className="px-5 py-4 text-sm font-semibold text-red-700">{loadError}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl shadow-stone-200/50">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                      user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {user.role === "admin" ? <Shield className="h-8 w-8" /> : <User className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-900">{user.full_name || user.username}</h3>
                    <p className="text-lg font-bold text-stone-400">@{user.username}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div
                  className={`rounded-2xl px-4 py-2 text-sm font-black uppercase ${
                    user.role === "admin"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                      : "bg-stone-800 text-white"
                  }`}
                >
                  {user.role}
                </div>
                <span
                  className={`inline-flex items-center gap-2 text-sm font-black uppercase ${
                    user.is_active ? "text-lime-600" : "text-stone-400"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-lime-500" : "bg-stone-300"}`} />
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-8 flex gap-3 border-t border-stone-100 pt-6">
                <Button variant="ghost" className="h-14 flex-1 rounded-2xl font-bold text-stone-400" disabled>
                  แก้ไข (เร็ว ๆ นี้)
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(user.id)}
                  disabled={isDeletingId === user.id}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-black">สร้างสมาชิกใหม่</DialogTitle>
            <DialogDescription className="text-lg font-medium text-stone-500">
              กำหนดบัญชีผู้ใช้งานสำหรับทีมงานในระบบ
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-400">ชื่อผู้ใช้งาน</label>
              <Input
                className="modal-field text-lg font-bold"
                value={newUser.username}
                onChange={(event) => setNewUser({ ...newUser, username: event.target.value })}
                placeholder="staff_01"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-400">รหัสผ่าน</label>
              <Input
                className="modal-field text-lg font-bold"
                type="password"
                value={newUser.password}
                onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-400">ชื่อที่แสดง</label>
              <Input
                className="modal-field text-lg font-bold"
                value={newUser.full_name}
                onChange={(event) => setNewUser({ ...newUser, full_name: event.target.value })}
                placeholder="ชื่อพนักงาน"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-black uppercase text-stone-400">สิทธิ์การใช้งาน</label>
              <select
                className="modal-select text-lg font-bold"
                value={newUser.role}
                onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
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
                className="h-14 flex-1 rounded-2xl font-bold"
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังสร้าง..." : "สร้างบัญชี"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
