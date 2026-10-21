import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit, Clock, FileText, Store, CreditCard, UserPlus, Globe } from "lucide-react";
import { ClientAccountsList } from "@/components/ClientAccountsList";
import { ClientStoresList } from "@/components/ClientStoresList";
import { ClientDocumentsList } from "@/components/ClientDocumentsList";
import { ClientWalletCard } from "@/components/ClientWalletCard";
import { ClientContractsList } from "@/components/ClientContractsList";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const client = await prisma.client.findUnique({
    where: { id: resolvedParams.id },
    include: {
      stores: true,
      documents: true,
      accounts: true,
      activities: {
        orderBy: { createdAt: "desc" }
      },
      services: {
        include: { service: true }
      },
      invoices: true,
      tasks: true,
      walletTransactions: {
        orderBy: { createdAt: "desc" }
      },
      contracts: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const platforms = await prisma.platformOption.findMany({ orderBy: { name: 'asc' }});

  if (!client) {
    notFound();
  }

  const totalInvoiced = client.invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalPaid = client.invoices.reduce((acc, inv) => acc + inv.paid, 0);
  const totalDebt = totalInvoiced - totalPaid;
  const activeTasks = client.tasks.filter(t => !t.completed).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">نشط</span>;
      case "INACTIVE": return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">متوقف</span>;
      case "LEAD": return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">عميل محتمل</span>;
      case "VIP": return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">VIP</span>;
      default: return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">غير محدد</span>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CLIENT_CREATED": return <UserPlus size={16} className="text-blue-500" />;
      case "STORE_ADDED": return <Store size={16} className="text-emerald-500" />;
      case "INVOICE_CREATED": return <FileText size={16} className="text-indigo-500" />;
      case "PAYMENT_RECEIVED": return <CreditCard size={16} className="text-emerald-500" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative z-10 flex items-center gap-5">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12 backdrop-blur-sm border border-white/10 transition-all hover:-translate-x-1">
              <ArrowRight size={22} />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/20" style={{ background: `linear-gradient(135deg, hsl(${client.name.length * 15 % 360}, 70%, 50%), hsl(${client.name.length * 25 % 360}, 70%, 40%))` }}>
              {client.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-3xl font-black text-white tracking-tight">{client.name}</h1>
                {getStatusBadge(client.status || "ACTIVE")}
              </div>
              {client.companyName && <p className="text-slate-300 font-medium opacity-90">{client.companyName}</p>}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <a href={`/portal/${client.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="h-12 px-5 gap-2 rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-sm transition-all cursor-pointer">
              <Globe size={18} className="text-blue-400" /> بوابة العميل 🌐
            </Button>
          </a>
          <a href={`https://wa.me/${client.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
            <Button className="h-12 px-6 gap-2 bg-[#25D366] hover:bg-[#1DA851] shadow-lg shadow-[#25D366]/20 rounded-2xl font-bold text-white transition-all hover:scale-105 cursor-pointer">
              مراسلة واتساب
            </Button>
          </a>
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline" className="h-12 px-6 gap-2 rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-sm transition-all cursor-pointer">
              <Edit size={18} /> تعديل الملف
            </Button>
          </Link>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Financial & Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-emerald-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> إجمالي المدفوعات
            </p>
            <p className="text-4xl font-black text-emerald-950">{totalPaid.toLocaleString()} <span className="text-lg font-bold text-emerald-900/50">ر.س</span></p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-rose-50 via-red-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-red-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> إجمالي المديونية
            </p>
            <p className="text-4xl font-black text-red-950">{totalDebt.toLocaleString()} <span className="text-lg font-bold text-red-900/50">ر.س</span></p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-bold text-blue-900/70 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> المهام النشطة
            </p>
            <p className="text-4xl font-black text-blue-950">{activeTasks} <span className="text-lg font-bold text-blue-900/50">مهمة</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* العمود الأيمن (المعلومات والمتاجر والتايم لاين) */}
        <div className="flex-1 space-y-6 w-full">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="border-b border-slate-50/80 bg-slate-50/50 rounded-t-3xl pb-4">
              <CardTitle className="flex justify-between items-center text-slate-800 text-lg">
                <span className="flex items-center gap-2"><FileText className="text-blue-500"/> المعلومات الأساسية للعميل</span>
                <Link href={`/clients/${client.id}/edit`}>
                  <Button size="sm" variant="ghost" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl">
                    <Edit size={14} /> تعديل
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold">رقم التواصل</p>
                  <p className="font-bold text-slate-800" dir="ltr" style={{ textAlign: 'right' }}>{client.phone}</p>
                </div>
                {client.email && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold">البريد الإلكتروني</p>
                    <p className="font-bold text-slate-800 truncate" dir="ltr" style={{ textAlign: 'right' }}>{client.email}</p>
                  </div>
                )}
                {client.companyName && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold">الشركة / المؤسسة</p>
                    <p className="font-bold text-slate-800">{client.companyName}</p>
                  </div>
                )}
                {client.taxId && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold">الرقم الضريبي</p>
                    <p className="font-bold text-slate-800" dir="ltr" style={{ textAlign: 'right' }}>{client.taxId}</p>
                  </div>
                )}
                {client.address && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-gray-500 font-bold">العنوان</p>
                    <p className="font-bold text-slate-800">{client.address}</p>
                  </div>
                )}
              </div>
              
              {client.notes && (
                <div className="pt-2">
                  <p className="text-sm font-bold text-slate-700 mb-2">ملاحظات العميل</p>
                  <p className="text-slate-600 whitespace-pre-wrap bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 leading-relaxed text-sm">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="border-b border-slate-50/80 bg-slate-50/50 rounded-t-3xl pb-4">
              <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
                <Store className="text-emerald-500" />
                متاجر العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ClientStoresList 
                clientId={client.id} 
                stores={client.stores} 
                accounts={client.accounts} 
                documents={client.documents} 
                platforms={platforms}
              />
            </CardContent>
          </Card>

          {/* العقود والاتفاقيات */}
          <ClientContractsList clientId={client.id} contracts={client.contracts} />

          <Card className="rounded-3xl border-none shadow-sm mb-12">
            <CardHeader className="border-b border-slate-50/80 bg-slate-50/50 rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                <Clock className="text-slate-400" size={20} />
                سجل نشاط العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {client.activities && client.activities.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {client.activities.map((activity: any) => (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 text-sm">{activity.description}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ar })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm font-medium">
                  لا يوجد سجل نشاطات لهذا العميل حتى الآن.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* العمود الأيسر (المحفظة) */}
        <div className="w-full md:w-[350px] space-y-6 shrink-0 sticky top-6">
          <ClientWalletCard client={client} transactions={client.walletTransactions} />
        </div>
      </div>
    </div>
  );
}
