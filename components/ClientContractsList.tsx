"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, CheckCircle2, Copy, PenTool, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CONTRACT_TEMPLATES = [
  {
    title: "عقد إنشاء وتجهيز متجر إلكتروني متكامل",
    content: `بعون الله وتوفيقه، تم الاتفاق بين الطرفين على ما يلي:
البند الأول: يلتزم الطرف الأول (مقدم الخدمة) بإنشاء وتجهيز متجر إلكتروني متكامل يشمل: تهيئة الإعدادات الأساسية، ربط بوابات الدفع الإلكتروني، ربط شركات الشحن، وتصميم واجهة المتجر.
البند الثاني: يلتزم الطرف الثاني (العميل) بتزويد الطرف الأول بكافة البيانات والمستندات المطلوبة (السجل التجاري، وثيقة العمل الحر، الحساب البنكي).
البند الثالث: مدة التنفيذ المتفق عليها هي (7 إلى 14 يوم عمل) تبدأ من تاريخ استلام كافة المتطلبات.
البند الرابع: الدفعات المالية يتم سدادها حسب الاتفاق (50% دفعة أولى قبل البدء، و50% عند تسليم المتجر نهائياً).`,
  },
  {
    title: "عقد إدارة وتشغيل وتطوير متجر شهري",
    content: `اتفاقية إدارة وتشغيل متجر إلكتروني:
البند الأول: تقديم خدمات الدعم الفني، متابعة المنتجات، تحديث العروض والأسعار، وإدارة الحملات الترويجية لمدة شهر ميلادي كامل.
البند الثاني: تقرير دوري يقدم للعميل كل أسبوعين بحالة أداء المتجر والزيارات والمبيعات.
البند الثالث: يتجدد هذا العقد تلقائياً بموافقة الطرفين وسداد الرسوم الشهرية مقدماً.`,
  },
];

export function ClientContractsList({ clientId, contracts = [] }: { clientId: string; contracts: any[] }) {
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(CONTRACT_TEMPLATES[0].title);
  const [content, setContent] = useState(CONTRACT_TEMPLATES[0].content);
  const [totalAmount, setTotalAmount] = useState("");

  const handleSelectTemplate = (tpl: any) => {
    setTitle(tpl.title);
    setContent(tpl.content);
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          totalAmount: Number(totalAmount) || 0,
        }),
      });

      if (res.ok) {
        toast.success("تم إنشاء العقد بنجاح!");
        setOpenAdd(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء حفظ العقد");
      }
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const copyPortalLink = () => {
    const link = `${window.location.origin}/portal/${clientId}`;
    navigator.clipboard.writeText(link);
    toast.success("تم نسخ رابط بوابة العميل وتوقيع العقود!");
  };

  return (
    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-50/80 bg-slate-50/50 rounded-t-3xl p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <CardTitle className="text-slate-800 text-lg">العقود والاتفاقيات الرقمية</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">عقود موثقة مع العميل تدعم التوقيع الإلكتروني المباشر.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyPortalLink} 
            className="rounded-xl h-10 gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 border-slate-200 cursor-pointer"
          >
            <Copy size={14} /> نسخ رابط البوابة والتوقيع
          </Button>

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-xl h-10 px-3 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-xs">
              <Plus size={14} /> إنشاء عقد جديد
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>صياغة عقد واتفاقية عمل جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateContract} className="space-y-4 mt-4">
                {/* Templates Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600">اختر نموذج عقد جاهز:</Label>
                  <div className="flex flex-wrap gap-2">
                    {CONTRACT_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          title === tpl.title 
                            ? "bg-blue-50 border-blue-400 text-blue-700 shadow-xs" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tpl.title.slice(0, 28)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>عنوان العقد</Label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>قيمة العقد المالية (ر.س) - اختياري</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={totalAmount} 
                    onChange={e => setTotalAmount(e.target.value)} 
                    className="h-11 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>بنود وشروط الاتفاقية</Label>
                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    rows={8}
                    required 
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 cursor-pointer">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "إنشاء وإرسال العقد للبوابة"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <PenTool size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">لا توجد عقود مسجلة لهذا العميل حتى الآن</p>
              <p className="text-xs text-slate-400 mt-1">أنشئ عقداً رسمياً وشاركه مع العميل ليقوم بتوقيعه إلكترونياً بالماوس أو شاشة الجوال.</p>
            </div>
          ) : (
            contracts.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      c.status === "SIGNED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      {c.status === "SIGNED" ? "تم التوقيع إلكترونياً ✓" : "بانتظار توقيع العميل ✍️"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    القيمة: {c.totalAmount ? `${c.totalAmount.toLocaleString()} ر.س` : "غير محدد"} • أنشئ بتاريخ: {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                  {c.status === "SIGNED" && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-emerald-700 font-medium">
                      <ShieldCheck size={14} />
                      الموقع: <strong>{c.signerName}</strong> ({new Date(c.signedAt).toLocaleDateString("ar-SA")})
                      {c.signatureData && (
                        <img src={c.signatureData} alt="Signature" className="h-7 w-auto object-contain bg-white rounded border border-emerald-200 p-0.5 inline-block mr-2" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={`/portal/${clientId}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 h-9 px-3 text-xs font-bold gap-1 text-slate-700 transition-colors shadow-2xs"
                  >
                    <ExternalLink size={12} /> معاينة في البوابة
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
