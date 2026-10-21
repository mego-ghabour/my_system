import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Briefcase, Tag, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      clients: true,
    }
  });

  const totalServices = services.length;
  const avgPrice = totalServices > 0 
    ? Math.round(services.reduce((acc, s) => acc + (s.basePrice || 0), 0) / totalServices)
    : 0;
  const totalSubscribers = services.reduce((acc, s) => acc + (s.clients?.length || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 backdrop-blur-sm shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              الخدمات والباقات
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {totalServices} خدمة
              </span>
            </h1>
            <p className="text-slate-300 font-medium opacity-90">إدارة دليل الخدمات، الأسعار الافتراضية، وربطها بالعملاء.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/services/new">
            <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 gap-2 text-md">
              <Plus className="w-5 h-5" />
              إضافة خدمة جديدة
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
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> إجمالي الخدمات
            </p>
            <p className="text-4xl font-black text-blue-950">{totalServices} <span className="text-lg font-bold text-blue-900/50">خدمة</span></p>
            <p className="text-xs text-blue-600/80 font-medium mt-2">معروضة في النظام</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-emerald-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> متوسط السعر
            </p>
            <p className="text-4xl font-black text-emerald-950">{avgPrice.toLocaleString()} <span className="text-lg font-bold text-emerald-900/50">ر.س</span></p>
            <p className="text-xs text-emerald-600/80 font-medium mt-2">متوسط أسعار الخدمات</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 via-pink-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-purple-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> الاشتراكات النشطة
            </p>
            <p className="text-4xl font-black text-purple-950">{totalSubscribers} <span className="text-lg font-bold text-purple-900/50">عميل</span></p>
            <p className="text-xs text-purple-600/80 font-medium mt-2">مشتركين في هذه الخدمات</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Tag size={22} />
                  </div>
                  <span className="font-black text-xl text-emerald-600 font-mono bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
                    {service.basePrice.toLocaleString()} ر.س
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                
                <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                  {service.description || "لا يوجد وصف مسجل لهذه الخدمة."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {new Date(service.createdAt).toLocaleDateString("ar-SA")}
                </span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  {service.clients?.length || 0} عملاء
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-500 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <Briefcase size={32} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">لم تقم بإضافة أي خدمات بعد</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">أضف خدماتك وباقاتك وأسعارها الافتراضية لتسهيل إدراجها في الفواتير وعروض الأسعار.</p>
            <Link href="/services/new">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-500/20 gap-2">
                <Plus size={18} /> إضافة أول خدمة
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
