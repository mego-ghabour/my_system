"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Image as ImageIcon, Copy, Check, Trash2, Loader2, Sparkles, FolderArchive } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AssetsClient({ initialAssets }: { initialAssets: any[] }) {
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "TEXT",
    content: "",
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ البيانات إلى الحافظة!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("تمت إضافة البيان بنجاح!");
        setFormData({ name: "", type: "TEXT", content: "" });
        setOpenAdd(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء الإضافة");
      }
    } catch {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البيان؟")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم الحذف بنجاح");
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">مستند / ملف</span>;
      case "IMAGE":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">صورة / شعار</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">نص / آيبان</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 backdrop-blur-sm shadow-inner">
            <FolderArchive className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              بيانات ومستندات المؤسسة
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-slate-300 font-medium opacity-90">حفظ الآيبانات البنكية، أرقام السجلات، والملفات الرسمية للوصول السريع ومشاركتها.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 gap-2 text-md inline-flex items-center justify-center cursor-pointer">
              <Plus className="w-5 h-5" />
              إضافة بيان جديد
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>إضافة بيان / أصل جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>اسم البيان</Label>
                  <Input 
                    placeholder="مثال: الآيبان البنكي (مصرف الراجحي)" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>نوع البيان</Label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="TEXT">نص عادي (مثل: آيبان، هاتف، بريد، نص)</option>
                    <option value="DOCUMENT">رابط مستند (PDF / Google Drive / Dropbox)</option>
                    <option value="IMAGE">رابط صورة (شعار، ختم، صورة شهادة)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>المحتوى أو الرابط</Label>
                  <textarea 
                    placeholder="أدخل النص أو الرابط هنا..."
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full min-h-[90px] p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-md rounded-xl mt-2">
                  {loading ? <Loader2 className="animate-spin" /> : "حفظ البيان"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialAssets.map((asset) => (
          <Card key={asset.id} className="rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    {asset.type === "IMAGE" ? <ImageIcon size={22} /> : <FileText size={22} />}
                  </div>
                  {getTypeBadge(asset.type)}
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {asset.name}
                </h3>

                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-xs font-mono text-slate-700 break-all select-all leading-relaxed">
                  {asset.content}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                <Button 
                  onClick={() => handleCopy(asset.id, asset.content)} 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl h-10 gap-1.5 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                >
                  {copiedId === asset.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copiedId === asset.id ? "تم النسخ!" : "نسخ البيان"}
                </Button>
                <Button 
                  onClick={() => handleDelete(asset.id)} 
                  disabled={deletingId === asset.id}
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl h-10 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 cursor-pointer"
                >
                  {deletingId === asset.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {initialAssets.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-500 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <FolderArchive size={32} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">لا توجد بيانات أو أصول محفوظة</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">احفظ السجل التجاري، رقم الآيبان، الروابط الرسمية، أو الملفات لمشاركتها مع العملاء فوراً.</p>
            <Button onClick={() => setOpenAdd(true)} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-500/20 gap-2 cursor-pointer">
              <Plus size={18} /> إضافة أول بيان
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
