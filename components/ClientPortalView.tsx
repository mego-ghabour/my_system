"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Store, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  TicketIcon, 
  PenTool, 
  ShieldCheck, 
  ExternalLink, 
  Receipt,
  Download,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/SignaturePad";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ClientPortalView({ client }: { client: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "contracts" | "financials" | "stores" | "tickets">("overview");
  const [signingContract, setSigningContract] = useState<any | null>(null);
  const [signingLoading, setSigningLoading] = useState(false);

  // New Ticket State
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);

  // System Brand
  const [systemName, setSystemName] = useState("إدارة الأعمال");
  const [systemLogo, setSystemLogo] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSystemName(localStorage.getItem("system_name") || "مؤسستنا التجارية");
      setSystemLogo(localStorage.getItem("system_logo") || "");
    }
  }, []);

  // Calculate stats
  const totalInvoices = client.invoices?.reduce((acc: number, inv: any) => acc + (inv.total || 0), 0) || 0;
  const totalPaid = client.invoices?.reduce((acc: number, inv: any) => acc + (inv.paid || 0), 0) || 0;
  const totalDebt = totalInvoices - totalPaid;
  const totalTasks = client.tasks?.length || 0;
  const completedTasks = client.tasks?.filter((t: any) => t.completed)?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const handleSignContract = async (signatureData: string, signerName: string) => {
    if (!signingContract) return;
    setSigningLoading(true);
    try {
      const res = await fetch(`/api/portal/${client.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: signingContract.id,
          signatureData,
          signerName,
        }),
      });

      if (res.ok) {
        toast.success("تم توثيق وتوقيع العقد بنجاح! 🎉");
        setSigningContract(null);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء حفظ التوقيع");
      }
    } catch {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setSigningLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    setTicketLoading(true);
    try {
      const res = await fetch(`/api/portal/${client.id}/ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticketTitle,
          description: ticketDesc,
        }),
      });

      if (res.ok) {
        toast.success("تم إرسال تذكرة الدعم بنجاح! سيتم الرد عليك قريباً.");
        setTicketTitle("");
        setTicketDesc("");
        setTicketModal(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء إرسال التذكرة");
      }
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans pb-24 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {systemLogo ? (
              <img src={systemLogo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                {systemName.slice(0, 1)}
              </div>
            )}
            <div>
              <span className="font-black text-slate-900 text-base block">{systemName}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">بوابة العميل الرقمية</span>
            </div>
          </div>

          <a 
            href={`https://wa.me/?text=مرحباً، أود الاستفسار بخصوص مشروعي`} 
            target="_blank" 
            rel="noreferrer"
          >
            <Button className="bg-[#25D366] hover:bg-[#1fa952] text-white font-bold rounded-2xl h-10 px-4 text-xs gap-2 shadow-xs cursor-pointer">
              <MessageSquare size={16} /> تواصل مع الدعم الفني
            </Button>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  لوحة المتابعة المباشرة
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  عميل {client.status === "VIP" ? "مميز (VIP)" : "معتمد"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                أهلاً بك، {client.name} 👋
              </h1>
              {client.companyName && (
                <p className="text-slate-300 font-medium text-sm">{client.companyName}</p>
              )}
            </div>

            {/* Project Progress Gauge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shrink-0 w-full md:w-64 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                <span>نسبة إنجاز المشروع:</span>
                <span className="font-mono text-sm text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">
                تم إنجاز {completedTasks} من أصل {totalTasks} مهام مسجلة
              </p>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-blue-900/70 mb-1">الرصيد في المحفظة</p>
              <p className="text-3xl font-black text-blue-950 font-mono">
                {(client.walletBalance || 0).toLocaleString()} <span className="text-sm font-bold text-blue-800">ر.س</span>
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-emerald-900/70 mb-1">إجمالي المدفوعات</p>
              <p className="text-3xl font-black text-emerald-950 font-mono">
                {totalPaid.toLocaleString()} <span className="text-sm font-bold text-emerald-800">ر.س</span>
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-rose-50 via-red-50/50 to-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-red-900/70 mb-1">المستحق المتبقي</p>
              <p className="text-3xl font-black text-red-950 font-mono">
                {totalDebt.toLocaleString()} <span className="text-sm font-bold text-red-800">ر.س</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock size={16} /> نظرة عامة
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "contracts" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={16} /> العقود والاتفاقيات
            {client.contracts?.some((c: any) => c.status === "PENDING") && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "financials" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt size={16} /> عروض الأسعار والفواتير
          </button>

          <button
            onClick={() => setActiveTab("stores")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "stores" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store size={16} /> المتاجر الإلكترونية
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "tickets" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TicketIcon size={16} /> الدعم والتعديلات
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Active Tasks list */}
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  مراحل ومهام المشروع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {client.tasks && client.tasks.length > 0 ? (
                    client.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white ${task.completed ? "bg-emerald-500" : "bg-slate-200 text-slate-400"}`}>
                          ✓
                        </span>
                        <span className={`text-sm font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {task.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-slate-400 text-sm">لا توجد مهام مسجلة حالياً.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Recent Activity */}
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" />
                  آخر التحديثات والإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {client.activities && client.activities.length > 0 ? (
                    client.activities.slice(0, 5).map((act: any) => (
                      <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 block mb-0.5">{act.description}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(act.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-slate-400 text-sm">لا توجد تحديثات جديدة مسجلة.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Contracts & E-Signatures */}
        {activeTab === "contracts" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">عقود واتفاقيات الخدمات</h3>
                <p className="text-xs text-slate-500 mt-0.5">يمكنك الاطلاع على بنود العقد وتوقيعه إلكترونياً لحفظ حقوق الطرفين.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.contracts && client.contracts.length > 0 ? (
                client.contracts.map((contract: any) => (
                  <Card key={contract.id} className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                    <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          contract.status === "SIGNED" 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                            : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                        }`}>
                          {contract.status === "SIGNED" ? "موقع ومعتمد ✓" : "بانتظار توقيعك ✍️"}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-black text-slate-900 mt-3">{contract.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-500 font-mono">
                        القيمة: {contract.totalAmount?.toLocaleString()} ر.س
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {contract.content}
                      </div>

                      {contract.status === "SIGNED" ? (
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                            <ShieldCheck size={16} />
                            تم التوقيع إلكترونياً بواسطة: {contract.signerName}
                          </div>
                          <p className="text-[10px] text-emerald-600 font-mono">
                            بتاريخ: {new Date(contract.signedAt).toLocaleString("ar-SA")}
                          </p>
                          {contract.signatureData && (
                            <div className="pt-2 border-t border-emerald-200/60">
                              <p className="text-[10px] font-bold text-slate-500 mb-1">صورة التوقيع الإلكتروني:</p>
                              <img src={contract.signatureData} alt="Signature" className="h-14 w-auto object-contain bg-white rounded-lg p-1 border border-emerald-200" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSigningContract(contract)}
                          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                        >
                          <PenTool size={18} /> توقيع العقد الآن
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                  <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-700 text-base">لا توجد عقود مسجلة لك حالياً</p>
                  <p className="text-xs text-slate-400 mt-1">سيتم إدراج أي عقد عمل جديد هنا لتتمكن من مراجعته وتوقيعه إلكترونياً.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Financials & Quotations */}
        {activeTab === "financials" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quotations */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900">عروض الأسعار المقدمة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.quotations && client.quotations.length > 0 ? (
                  client.quotations.map((q: any) => (
                    <Card key={q.id} className="rounded-3xl border border-slate-100 shadow-sm p-6 bg-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-900">عرض سعر #{q.id.slice(-6).toUpperCase()}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {q.status === "ACCEPTED" ? "معتمد" : "مرسل"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{new Date(q.createdAt).toLocaleDateString("ar-SA")}</p>
                        <p className="font-black text-xl text-blue-600 font-mono mt-2">{q.total?.toLocaleString()} ر.س</p>
                      </div>
                      <Link href={`/quotations/${q.id}`} target="_blank">
                        <Button variant="outline" className="rounded-xl h-10 gap-1.5 font-bold text-xs cursor-pointer">
                          <ExternalLink size={14} /> معاينة وطباعة
                        </Button>
                      </Link>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full py-8 text-center text-slate-400 text-sm">لا توجد عروض أسعار مسجلة.</p>
                )}
              </div>
            </div>

            {/* Invoices */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-lg font-black text-slate-900">فواتير العمليات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.invoices && client.invoices.length > 0 ? (
                  client.invoices.map((inv: any) => (
                    <Card key={inv.id} className="rounded-3xl border border-slate-100 shadow-sm p-6 bg-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-900">فاتورة #{inv.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            inv.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}>
                            {inv.status === "PAID" ? "مسددة بالكامل" : "مستحقة"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{new Date(inv.createdAt).toLocaleDateString("ar-SA")}</p>
                        <div className="mt-2 text-xs space-y-0.5">
                          <span className="text-slate-500">الإجمالي: <strong className="font-mono text-slate-800">{inv.total?.toLocaleString()} ر.س</strong></span>
                          {inv.paid > 0 && <span className="text-emerald-600 block">المدفوع: {inv.paid?.toLocaleString()} ر.س</span>}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full py-8 text-center text-slate-400 text-sm">لا توجد فواتير مسجلة.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Stores */}
        {activeTab === "stores" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900">متاجرك الإلكترونية المسجلة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {client.stores && client.stores.length > 0 ? (
                client.stores.map((st: any) => (
                  <Card key={st.id} className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Store size={22} />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {st.platformName}
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-900">{st.name}</h4>
                    {st.storeUrl && (
                      <a href={st.storeUrl.startsWith("http") ? st.storeUrl : `https://${st.storeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono">
                        <ExternalLink size={12} /> زيارة المتجر
                      </a>
                    )}
                  </Card>
                ))
              ) : (
                <p className="col-span-full py-12 text-center text-slate-400">لا توجد متاجر مضافة حالياً.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Support Tickets */}
        {activeTab === "tickets" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">تذاكر الدعم وطلب التعديلات</h3>
                <p className="text-xs text-slate-500 mt-0.5">يمكنك إرسال طلب تعديل أو استفسار فني وسيقوم فريقنا بمراجعته فوراً.</p>
              </div>

              <Dialog open={ticketModal} onOpenChange={setTicketModal}>
                <DialogTrigger className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 cursor-pointer transition-colors shadow-xs">
                  <Plus size={16} /> فتح تذكرة جديدة
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle>فتح تذكرة دعم أو طلب تعديل</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>عنوان التذكرة / الطلب</Label>
                      <Input 
                        placeholder="مثال: تعديل ألوان الشعار في المتجر"
                        value={ticketTitle}
                        onChange={e => setTicketTitle(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تفاصيل الطلب</Label>
                      <textarea 
                        placeholder="اكتب التعديلات المطلوبة بالتفصيل..."
                        value={ticketDesc}
                        onChange={e => setTicketDesc(e.target.value)}
                        required
                        className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                      />
                    </div>
                    <Button type="submit" disabled={ticketLoading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                      {ticketLoading ? "جاري الإرسال..." : "إرسال التذكرة"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {client.tickets && client.tickets.length > 0 ? (
                client.tickets.map((tk: any) => (
                  <Card key={tk.id} className="rounded-2xl border border-slate-100 shadow-sm p-5 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-base text-slate-800">{tk.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tk.status === "CLOSED" ? "bg-slate-100 text-slate-600" : "bg-purple-100 text-purple-700"
                      }`}>
                        {tk.status === "CLOSED" ? "مكتملة ومغلقة" : "قيد المعالجة"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{tk.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-3">
                      تاريخ الفتح: {new Date(tk.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </Card>
                ))
              ) : (
                <p className="text-center py-12 text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200">
                  لا توجد تذاكر دعم مفتوحة.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Contract Signing Modal */}
      <Dialog open={!!signingContract} onOpenChange={(open) => !open && setSigningContract(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
              <PenTool size={20} className="text-blue-600" />
              توقيع العقد: {signingContract?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {signingContract?.content}
            </div>

            <SignaturePad onSign={handleSignContract} loading={signingLoading} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
