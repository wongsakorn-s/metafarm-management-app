import { useEffect, useState } from "react";
import { Trash2, UserPlus, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState(initialUser);

  const loadUsers = () => {
    userService.getAll()
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to load users", err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    userService.create(newUser)
      .then(() => {
        setShowForm(false);
        setNewUser(initialUser);
        loadUsers();
      })
      .catch(err => alert(err.response?.data?.detail || "เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน"));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("ต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
      userService.delete(id).then(loadUsers).catch(err => alert(err.response?.data?.detail));
    }
  };

  return (
    <div className="page-shell space-y-8 md:space-y-12 pb-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-stone-900 md:text-7xl">จัดการสมาชิก</h1>
          <p className="text-xl font-bold text-stone-500">ควบคุมสิทธิ์และบัญชีผู้ใช้งานพนักงาน</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="h-16 rounded-[2rem] bg-amber-500 text-xl font-black px-8 shadow-xl shadow-amber-200 hover:bg-amber-600">
          <UserPlus className="mr-3 h-6 w-6" />
          เพิ่มสมาชิกใหม่
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Card key={user.id} className="overflow-hidden border-none bg-white shadow-2xl shadow-stone-200/50 rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                    {user.role === 'admin' ? <Shield className="h-8 w-8" /> : <User className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-900">{user.full_name || user.username}</h3>
                    <p className="text-lg font-bold text-stone-400">@{user.username}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                 <div className={`rounded-2xl px-4 py-2 text-sm font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-stone-800 text-white'}`}>
                    {user.role}
                 </div>
                 <span className={`inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest ${user.is_active ? 'text-lime-600' : 'text-stone-400'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${user.is_active ? 'bg-lime-500' : 'bg-stone-300'}`} />
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-8 flex gap-3 border-t border-stone-100 pt-6">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-stone-400 font-bold" disabled>แก้ไข (เร็วๆ นี้)</Button>
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-black">สร้างสมาชิกใหม่</DialogTitle>
            <DialogDescription className="text-lg text-stone-500 font-medium">กำหนดบัญชีผู้ใช้งานสำหรับพนักงานในฟาร์ม</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-stone-400 ml-1">ชื่อผู้ใช้งาน</label>
              <Input 
                className="h-14 rounded-2xl text-lg font-bold bg-stone-50 border-none"
                value={newUser.username} 
                onChange={e => setNewUser({...newUser, username: e.target.value})} 
                placeholder="staff_01"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-stone-400 ml-1">รหัสผ่าน</label>
              <Input 
                className="h-14 rounded-2xl text-lg font-bold bg-stone-50 border-none"
                type="password"
                value={newUser.password} 
                onChange={e => setNewUser({...newUser, password: e.target.value})} 
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-stone-400 ml-1">สิทธิ์การใช้งาน</label>
              <select
                className="flex h-14 w-full rounded-2xl bg-stone-50 px-4 py-2 text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="operator">Operator (บันทึกข้อมูล)</option>
                <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                <option value="viewer">Viewer (เข้าชมภายใน)</option>
              </select>
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setShowForm(false)}>ยกเลิก</Button>
              <Button type="submit" className="h-14 flex-1 rounded-2xl bg-stone-900 text-lg font-black shadow-xl shadow-stone-200">สร้างบัญชี</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
