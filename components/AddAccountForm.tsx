"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AddAccountForm({ clientId, storeId }: { clientId: string, storeId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    link: "",
    storeId: storeId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${clientId}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("تم إضافة الحساب بنجاح!");
        setFormData({ name: "", username: "", password: "", link: "", storeId: storeId || "" });
        setOpen(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء إضافة الحساب.");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-start">
        <DialogTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 gap-2 cursor-pointer shadow-sm">
          <Plus size={16} /> إضافة حساب خارجي
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة حساب جديد (تطبيقات، بوابات دفع، الخ)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="اسم الحساب أو التطبيق (مثال: تابي)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              placeholder="اسم المستخدم أو الإيميل"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              dir="ltr"
              className="text-right"
            />
            <Input
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              dir="ltr"
              className="text-right"
            />
            <Input
              placeholder="رابط تسجيل الدخول (اختياري)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              dir="ltr"
              className="text-right"
            />
          </div>
          <Button type="submit" disabled={loading || !formData.name} size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            حفظ وإضافة الحساب
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
