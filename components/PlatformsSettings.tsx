"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Store } from "lucide-react";

export function PlatformsSettings() {
  const [platforms, setPlatforms] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch("/api/settings/platforms");
      const data = await res.json();
      setPlatforms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/settings/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        toast.success("تم إضافة المنصة بنجاح");
        setNewName("");
        fetchPlatforms();
      } else {
        toast.error("هذه المنصة موجودة مسبقاً أو حدث خطأ");
      }
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/platforms/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم الحذف بنجاح");
        fetchPlatforms();
      }
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  return (
    <Card className="border border-emerald-100 shadow-sm overflow-hidden rounded-3xl bg-white">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <Store size={22} />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-800">منصات المتاجر الإلكترونية</CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">المنصات المعتمدة التي تظهر تلقائياً في القوائم المنسدلة عند إضافة أو تعديل متاجر العملاء (مثل: سلة، زد، شوبيفاي).</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <Input 
            placeholder="أدخل اسم منصة جديدة (مثال: أوبن كارت، ووكومرس...)" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            className="flex-1 h-12 rounded-xl text-sm"
          />
          <Button type="submit" disabled={!newName.trim() || adding} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 rounded-xl gap-2 shadow-md shadow-emerald-600/20 cursor-pointer">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            إضافة منصة
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {platforms.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full text-sm">
                لم تقم بإضافة أي منصات بعد. أضف منصاتك لتسهيل اختيارها أثناء إنشاء متاجر العملاء.
              </div>
            ) : (
              platforms.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-200/80 rounded-xl pl-2 pr-4 py-2 text-sm font-bold text-emerald-900 shadow-xs hover:border-emerald-300 transition-colors">
                  <span>{p.name}</span>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 hover:bg-red-100/50 p-1 rounded-lg transition-colors mr-1 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
