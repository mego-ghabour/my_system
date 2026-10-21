"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Briefcase, Save, Loader2, Sparkles } from "lucide-react";

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      basePrice: parseFloat(formData.get("basePrice") as string),
    };

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("تم إضافة الخدمة بنجاح! 🎉");
        router.push("/services");
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء حفظ الخدمة");
      }
    } catch (error) {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex items-center justify-between">
        <div className="relative z-10 flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12 backdrop-blur-sm border border-white/10 transition-all hover:-translate-x-1 cursor-pointer"
          >
            <span className="rtl:rotate-180 text-xl font-bold">←</span>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              إضافة خدمة جديدة
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-slate-300 font-medium opacity-90">تسجيل باقة أو خدمة جديدة لتضمينها في عروض الأسعار والفواتير.</p>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">بيانات وتفاصيل الخدمة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-slate-700">اسم الخدمة <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="مثال: إنشاء وتجهيز متجر سلة متكامل..." 
                className="h-12 rounded-xl text-sm border-slate-200" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-slate-700">الوصف ومحتوى الخدمة (اختياري)</Label>
              <textarea 
                id="description" 
                name="description"
                className="flex min-h-[110px] w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                placeholder="تفاصيل ما تتضمنه الخدمة من إعدادات وتصاميم وربط بوابات دفع..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-sm font-bold text-slate-700">السعر الافتراضي (ر.س) <span className="text-red-500">*</span></Label>
              <Input 
                id="basePrice" 
                name="basePrice" 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="1500" 
                className="h-12 rounded-xl text-lg font-bold font-mono border-slate-200" 
                required 
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-md shadow-md shadow-blue-500/20 cursor-pointer" 
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? "جاري الحفظ..." : "حفظ الخدمة في الدليل"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer" 
                onClick={() => router.back()}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
