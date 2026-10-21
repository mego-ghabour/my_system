import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { Users, ListTodo, AlertCircle, TrendingUp, Sparkles, Activity } from "lucide-react";
import { RevenueChart } from "@/components/RevenueChart";
import { DebtChart } from "@/components/DebtChart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch real data
  const totalClients = await prisma.client.count();
  const pendingTasks = await prisma.task.count({ where: { completed: false } });
  
  const invoices = await prisma.invoice.findMany();
  
  const totalDebt = invoices
    .filter(i => i.status !== "PAID")
    .reduce((acc, curr) => acc + (curr.total - curr.paid), 0);
    
  const totalRevenue = invoices
    .reduce((acc, curr) => acc + curr.paid, 0);

  // --- Chart Data Processing ---

  // 1. Debt vs Paid Pie Chart
  const debtChartData = [
    { name: "المبالغ المحصلة (المدفوعة)", value: totalRevenue },
    { name: "المبالغ المعلقة (الديون)", value: totalDebt },
  ];

  // 2. Revenue Last 6 Months
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleDateString('ar-EG', { month: 'short' }),
      monthNum: d.getMonth(),
      year: d.getFullYear(),
      revenue: 0
    };
  }).reverse();

  invoices.forEach(inv => {
    const invDate = new Date(inv.createdAt);
    const month = invDate.getMonth();
    const year = invDate.getFullYear();
    const match = last6Months.find(m => m.monthNum === month && m.year === year);
    if (match) {
      match.revenue += inv.paid;
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1.5">
              مرحباً بعودتك، {session.user?.name || "مدير النظام"}! <Sparkles className="w-5 h-5 text-yellow-300" />
            </h1>
            <p className="text-blue-100 text-sm opacity-90">
              إليك نظرة شاملة على أداء أعمالك اليوم. الأمور تبدو جيدة!
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/20">
            <Activity className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-medium">النظام يعمل بكفاءة</span>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden hover:-translate-y-0.5 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-bold text-gray-500">إجمالي العملاء</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <div className="text-3xl font-black text-gray-900">{totalClients}</div>
            <p className="text-[11px] text-green-500 mt-1.5 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> نشط في النظام
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden hover:-translate-y-0.5 group animate-in slide-in-from-bottom-4 delay-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-bold text-gray-500">مهام قيد التنفيذ</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <ListTodo className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <div className="text-3xl font-black text-gray-900">{pendingTasks}</div>
            <p className="text-[11px] text-orange-500 mt-1.5 font-medium">مهام تحتاج لتدخلك</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden hover:-translate-y-0.5 group animate-in slide-in-from-bottom-4 delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-bold text-gray-500">الديون المتأخرة</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <div className="text-3xl font-black text-gray-900">{totalDebt.toLocaleString()} <span className="text-base font-bold text-gray-400">ر.س</span></div>
            <p className="text-[11px] text-red-500 mt-1.5 font-medium">مبالغ غير محصلة</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden hover:-translate-y-0.5 group animate-in slide-in-from-bottom-4 delay-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-bold text-gray-500">إجمالي الإيرادات</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <div className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString()} <span className="text-base font-bold text-gray-400">ر.س</span></div>
            <p className="text-[11px] text-emerald-500 mt-1.5 font-medium">إجمالي المبالغ المدفوعة</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-3">
            <h2 className="text-base font-bold text-gray-800">إيرادات آخر 6 أشهر</h2>
            <p className="text-xs text-gray-500">تتبع الإيرادات الشهرية المحصلة</p>
          </div>
          <RevenueChart data={last6Months} />
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-3">
            <h2 className="text-base font-bold text-gray-800">حالة المدفوعات</h2>
            <p className="text-xs text-gray-500">مقارنة بين الإيرادات والديون المستحقة</p>
          </div>
          <DebtChart data={debtChartData} />
        </div>
      </div>
    </div>
  );
}
