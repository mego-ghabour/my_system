import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, FileText, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const totalQuotations = quotations.length;
  const acceptedQuotations = quotations.filter(q => q.status === "ACCEPTED");
  const pendingQuotations = quotations.filter(q => q.status === "SENT");
  const totalValue = quotations.reduce((acc, q) => acc + (q.total || 0), 0);
  const acceptedValue = acceptedQuotations.reduce((acc, q) => acc + (q.total || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 backdrop-blur-sm shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              عروض الأسعار
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {totalQuotations} عرض
              </span>
            </h1>
            <p className="text-slate-300 font-medium opacity-90">إعداد، إرسال، ومتابعة عروض الأسعار المقدمة لعملائك.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/quotations/new">
            <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 gap-2 text-md">
              <Plus className="w-5 h-5" />
              إنشاء عرض سعر
            </Button>
          </Link>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-blue-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> إجمالي العروض
            </p>
            <p className="text-4xl font-black text-blue-950">{totalValue.toLocaleString()} <span className="text-lg font-bold text-blue-900/50">ر.س</span></p>
            <p className="text-xs text-blue-600/80 font-medium mt-2">{totalQuotations} عرض سعر مسجل</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-emerald-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> العروض المقبولة
            </p>
            <p className="text-4xl font-black text-emerald-950">{acceptedValue.toLocaleString()} <span className="text-lg font-bold text-emerald-900/50">ر.س</span></p>
            <p className="text-xs text-emerald-600/80 font-medium mt-2">{acceptedQuotations.length} عروض تمت الموافقة عليها</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 via-orange-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-amber-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> بانتظار الرد
            </p>
            <p className="text-4xl font-black text-amber-950">{pendingQuotations.length} <span className="text-lg font-bold text-amber-900/50">عروض</span></p>
            <p className="text-xs text-amber-600/80 font-medium mt-2">عروض تم إرسالها للعميل</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Quotation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotations.map((quote) => (
          <Link key={quote.id} href={`/quotations/${quote.id}`} className="block group">
            <Card className="rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden bg-white h-full">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <FileText size={22} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                      quote.status === "DRAFT" ? "bg-slate-100 text-slate-700" :
                      quote.status === "SENT" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      quote.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                      "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}>
                      {quote.status === "DRAFT" ? "مسودة" :
                       quote.status === "SENT" ? "بانتظار الرد" :
                       quote.status === "ACCEPTED" ? "مقبول" : "مرفوض"}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {quote.client.name}
                  </h3>
                  {quote.client.companyName && (
                    <p className="text-xs font-medium text-slate-400 mb-2">{quote.client.companyName}</p>
                  )}
                  <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 font-mono">
                    <Clock size={13} />
                    {new Date(quote.createdAt).toLocaleDateString("ar-SA")}
                  </p>

                  {quote.items && quote.items.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-3 mb-4 space-y-1.5 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500">البنود ({quote.items.length}):</p>
                      {quote.items.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="text-xs text-slate-700 flex justify-between">
                          <span className="truncate">{item.title}</span>
                          <span className="font-mono font-bold text-slate-900">{item.price} ر.س</span>
                        </div>
                      ))}
                      {quote.items.length > 2 && (
                        <p className="text-[10px] text-slate-400">+{quote.items.length - 2} بنود إضافية</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-2">
                  <div>
                    <span className="text-slate-400 text-[11px] block">المبلغ الإجمالي</span>
                    <span className="font-black text-xl text-blue-600">{quote.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span></span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all">
                    عرض وطباعة 🖨️
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {quotations.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-500 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <FileText size={32} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">لا توجد عروض أسعار حتى الآن</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">ابدأ بإنشاء أول عرض سعر لتقديمه لعملائك ومتابعة حالتهم بكل سهولة.</p>
            <Link href="/quotations/new">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-500/20 gap-2">
                <Plus size={18} /> إنشاء عرض سعر جديد
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
