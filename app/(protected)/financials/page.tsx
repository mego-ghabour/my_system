import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Receipt, AlertCircle, TrendingUp, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { FinancialsListClient } from "@/components/FinancialsListClient";

export default async function FinancialsPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true }
  });

  const totalUnpaid = invoices
    .filter(i => i.status !== "PAID")
    .reduce((acc, curr) => acc + (curr.total - curr.paid), 0);

  const totalCollected = invoices
    .reduce((acc, curr) => acc + curr.paid, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-50 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              الإدارة المالية
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-gray-500 font-medium mt-1">تتبع الفواتير، ديون العملاء والمبالغ المحصلة بوضوح وسهولة.</p>
          </div>
        </div>

        <div className="relative z-10">
          <Link href="/financials/new">
            <Button className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 gap-2 text-md">
              <Plus className="w-5 h-5" />
              إصدار فاتورة جديدة
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-3xl overflow-hidden group animate-in slide-in-from-bottom-4 delay-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-gray-500 font-bold">الديون المتأخرة</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-5xl font-black text-gray-900">{totalUnpaid.toLocaleString()} <span className="text-xl font-bold text-gray-400">ر.س</span></div>
            <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">مبالغ غير محصلة قيد الانتظار</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-3xl overflow-hidden group animate-in slide-in-from-bottom-4 delay-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-gray-500 font-bold">إجمالي المحصل</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-5xl font-black text-gray-900">{totalCollected.toLocaleString()} <span className="text-xl font-bold text-gray-400">ر.س</span></div>
            <p className="text-xs text-emerald-500 mt-2 font-medium flex items-center gap-1">تم تحصيلها بنجاح</p>
          </CardContent>
        </Card>
      </div>

      <div className="animate-in slide-in-from-bottom-6 delay-300">
        <FinancialsListClient initialInvoices={invoices} />
      </div>
    </div>
  );
}
