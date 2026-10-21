"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowRight, AlertCircle, Loader2, User, Building2, Phone, Mail, FileText, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { z } from "zod";

// --- Validation Schema ---
const clientSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string()
    .regex(/^(05|\+9665)[0-9]{8}$/, "رقم الجوال يجب أن يكون سعودي صحيح (مثال: 0500000000)"),
  email: z.union([z.literal(""), z.string().email("صيغة البريد الإلكتروني غير صحيحة")]),
  companyName: z.string().optional(),
  taxId: z.union([
    z.literal(""), 
    z.string().length(15, "الرقم الضريبي 15 رقماً بالضبط").regex(/^[0-9]+$/, "أرقام فقط")
  ]),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof clientSchema>;

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [client, setClient] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    taxId: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetch(`/api/clients/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setClient({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          companyName: data.companyName || "",
          taxId: data.taxId || "",
          address: data.address || "",
          notes: data.notes || "",
        });
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const handleChange = (field: keyof FormData, value: string) => {
    setClient(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = clientSchema.safeParse(client);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("يرجى مراجعة الأخطاء في النموذج");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (res.ok) {
        toast.success("تم تحديث بيانات العميل بنجاح 🎉");
        router.push(`/clients/${resolvedParams.id}`);
        router.refresh();
      } else {
        const errorText = await res.text();
        toast.error(errorText || "حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const ErrorMsg = ({ msg }: { msg?: string }) => {
    if (!msg) return null;
    return <p className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle size={12}/> {msg}</p>;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 text-slate-400 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="font-medium animate-pulse">جاري تحميل بيانات العميل...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex items-center justify-between">
        <div className="relative z-10 flex items-center gap-5">
          <Link href={`/clients/${resolvedParams.id}`}>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12 backdrop-blur-sm border border-white/10 transition-all hover:-translate-x-1">
              <ArrowRight size={22} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2 tracking-tight mb-1">
              تعديل بيانات العميل
              <Sparkles className="w-6 h-6 text-slate-300" />
            </h1>
            <p className="text-slate-300 text-sm font-medium opacity-90">
              تحديث وتعديل بيانات ملف العميل الأساسية.
            </p>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="relative">
          <div className="absolute top-0 right-8 w-1 h-full bg-slate-100 -z-10 rounded-full hidden md:block"></div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="hidden md:flex flex-col items-center mt-6 shrink-0 w-16">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-200">
                <span className="font-black text-xl">1</span>
              </div>
            </div>
            <Card className="flex-1 border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
              <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">البيانات الأساسية</h2>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700 font-bold text-sm mb-2 block">اسم العميل <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input 
                      placeholder="أدخل الاسم الثلاثي"
                      className={`h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm shadow-sm ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                      value={client.name}
                      onChange={e => handleChange('name', e.target.value)}
                    />
                  </div>
                  <ErrorMsg msg={errors.name} />
                </div>

                <div>
                  <Label className="text-slate-700 font-bold text-sm mb-2 block">رقم الواتساب <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input 
                      dir="ltr"
                      placeholder="05XXXXXXXX"
                      className={`h-12 pr-10 pl-4 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-right font-mono text-sm shadow-sm tracking-wider ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                      value={client.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                  </div>
                  <ErrorMsg msg={errors.phone} />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-slate-700 font-bold text-sm mb-2 block">البريد الإلكتروني</Label>
                  <div className="relative group md:w-1/2 md:pr-3">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input 
                      dir="ltr"
                      placeholder="example@domain.com"
                      className={`h-12 pr-10 pl-4 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-right text-sm shadow-sm ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-blue-500 focus:ring-blue-500/20'}`}
                      value={client.email}
                      onChange={e => handleChange('email', e.target.value)}
                    />
                  </div>
                  <ErrorMsg msg={errors.email} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2: Company Info */}
        <div className="relative">
          <div className="absolute top-0 right-8 w-1 h-full bg-slate-100 -z-10 rounded-full hidden md:block"></div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="hidden md:flex flex-col items-center mt-6 shrink-0 w-16">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-200">
                <span className="font-black text-xl">2</span>
              </div>
            </div>
            <Card className="flex-1 border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
              <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                  <Building2 size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">بيانات المؤسسة</h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-700 font-bold text-sm mb-2 block">اسم الشركة / المتجر</Label>
                    <Input 
                      placeholder="مؤسسة قمة التقنية..."
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-all text-sm shadow-sm"
                      value={client.companyName}
                      onChange={e => handleChange('companyName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-bold text-sm mb-2 block">الرقم الضريبي <span className="text-slate-400 font-normal text-xs">(15 رقم)</span></Label>
                    <Input 
                      dir="ltr"
                      placeholder="300000000000003"
                      className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-right font-mono text-sm shadow-sm tracking-wider ${errors.taxId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-indigo-500 focus:ring-indigo-500/20'}`}
                      value={client.taxId}
                      onChange={e => handleChange('taxId', e.target.value)}
                      maxLength={15}
                    />
                    <ErrorMsg msg={errors.taxId} />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 font-bold text-sm mb-2 block">العنوان الوطني</Label>
                  <div className="relative group">
                    <MapPin className="absolute right-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <textarea 
                      placeholder="الرياض، طريق الملك فهد..."
                      className="w-full min-h-[80px] p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm resize-none shadow-sm"
                      value={client.address}
                      onChange={e => handleChange('address', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: Notes */}
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="hidden md:flex flex-col items-center mt-6 shrink-0 w-16">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner border border-amber-200">
                <span className="font-black text-xl">3</span>
              </div>
            </div>
            <Card className="flex-1 border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6">
                <Label className="text-slate-700 font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="text-amber-500" size={18} />
                  ملاحظات وتفاصيل إضافية
                </Label>
                <textarea 
                  placeholder="أي معلومات أخرى تود إضافتها لملف العميل..."
                  className="w-full min-h-[120px] p-4 rounded-xl bg-amber-50/30 border border-amber-100 focus:bg-white focus:border-amber-400 transition-all outline-none focus:ring-4 focus:ring-amber-400/10 text-sm leading-relaxed resize-none shadow-inner"
                  value={client.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 md:pr-[88px]">
          <Button 
            type="submit" 
            disabled={saving} 
            className="h-14 px-10 rounded-2xl gap-3 bg-slate-800 hover:bg-slate-900 shadow-xl shadow-slate-900/20 text-white font-bold text-lg w-full md:w-auto transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </div>
  );
}
