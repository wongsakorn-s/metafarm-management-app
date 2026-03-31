import { useEffect, useState } from "react";
import { Plus, Trash2, UserCog, UserPlus, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/api";

interface UserData {
  id: number;
  username: str;
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
    <div className="page-shell space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">จัดการสมาชิก</h1>
          <p className="text-stone-500">จัดการรายชื่อพนักงานและสิทธิ์การเข้าใช้งานระบบ</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-2xl">
          <UserPlus className="mr-2 h-4 w-4" />
          เพิ่มสมาชิกใหม่
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Card key={user.id} className="overflow-hidden border-stone-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                    {user.role === 'admin' ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{user.full_name || user.username}</h3>
                    <p className="text-sm text-stone-500">@{user.username}</p>
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                  {user.role}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.is_active ? 'text-lime-600' : 'text-stone-400'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-lime-500' : 'bg-stone-300'}`} />
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มสมาชิกใหม่</DialogTitle>
            <DialogDescription>สร้างบัญชีผู้ใช้งานใหม่สำหรับพนักงานในฟาร์ม</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">ชื่อผู้ใช้งาน (Username)</label>
              <Input 
                value={newUser.username} 
                onChange={e => setNewUser({...newUser, username: e.target.value})} 
                placeholder="เช่น staff_01"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">รหัสผ่าน</label>
              <Input 
                type="password"
                value={newUser.password} 
                onChange={e => setNewUser({...newUser, password: e.target.value})} 
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">ชื่อ-นามสกุล</label>
              <Input 
                value={newUser.full_name} 
                onChange={e => setNewUser({...newUser, full_name: e.target.value})} 
                placeholder="เช่น นายสมชาย รักผึ้ง"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">ตำแหน่งสิทธิ์ (Role)</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="operator">Operator (พนักงานบันทึกข้อมูล)</option>
                <option value="admin">Admin (ผู้ดูแลระบบสูงสุด)</option>
                <option value="viewer">Viewer (ผู้เข้าชมภายใน)</option>
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>ยกเลิก</Button>
              <Button type="submit">สร้างบัญชี</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
