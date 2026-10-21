"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Smartphone, 
  CheckCircle, 
  RefreshCw, 
  MessageCircle, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Terminal, 
  Copy, 
  LogOut,
  QrCode,
  Check,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppStatus {
  status: "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "OFFLINE";
  qrCode: string | null;
  serviceOnline: boolean;
  info?: {
    phone?: string;
    name?: string;
  } | null;
  error?: string;
}

export default function WhatsAppPage() {
  const [data, setData] = useState<WhatsAppStatus>({
    status: "CONNECTING",
    qrCode: null,
    serviceOnline: true,
    info: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Test form
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchStatus = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/whatsapp", { cache: "no-store" });
      const json = await res.json();
      setData({
        status: json.status || "OFFLINE",
        qrCode: json.qrCode || null,
        serviceOnline: !!json.serviceOnline,
        info: json.info || null,
        error: json.error,
      });
      if (manual) {
        if (json.serviceOnline) {
          toast.success("تم تحديث حالة الاتصال بنجاح");
        } else {
          toast.error("خدمة الواتساب غير نشطة حالياً");
        }
      }
    } catch {
      setData((prev) => ({
        ...prev,
        status: "OFFLINE",
        serviceOnline: false,
        qrCode: null,
      }));
      if (manual) {
        toast.error("تعذر الوصول لخادم الواتساب");
      }
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 4 seconds to track QR refresh or status change
    const interval = setInterval(() => {
      fetchStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("npm run whatsapp");
    setCopiedCmd(true);
    toast.success("تم نسخ الأمر للحافظة!");
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleLogout = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في تسجيل الخروج وقطع ربط هذا الجهاز؟")) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (res.ok) {
        toast.success("تم قطع الاتصال بنجاح. سيتم توليد باركود جديد.");
        fetchStatus(true);
      } else {
        toast.error("فشل قطع الاتصال");
      }
    } catch {
      toast.error("حدث خطأ أثناء محاولة قطع الاتصال");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber || !testMessage) return;
    setSending(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          number: testNumber,
          message: testMessage,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success("تم إرسال الرسالة بنجاح!");
        setTestMessage("");
      } else {
        toast.error(resData.error || "فشل إرسال الرسالة. تأكد من صحة الرقم.");
      }
    } catch {
      toast.error("تعذر الاتصال بخدمة الواتساب");
    } finally {
      setSending(false);
    }
  };

  const setTemplate = (msg: string) => {
    setTestMessage(msg);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-teal-50 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              ربط الواتساب الآلي
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base mt-1">
              إرسال فوري وتلقائي للفواتير، عروض الأسعار، وتنبيهات التذاكر عبر واتساب أعمال.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>مشفر وآمن بالكامل</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="rounded-xl border-slate-200 h-9 gap-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            تحديث الحالة
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Connection & QR Code Section (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white h-full flex flex-col">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-bold text-slate-800">
                  <Smartphone className="w-5 h-5 text-emerald-600" /> 
                  حالة ربط الجهاز
                </CardTitle>
                <div>
                  {data.status === "CONNECTED" && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      متصل ونشط
                    </span>
                  )}
                  {data.status === "CONNECTING" && data.serviceOnline && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      بانتظار المسح
                    </span>
                  )}
                  {(!data.serviceOnline || data.status === "OFFLINE") && (
                    <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      الخدمة متوقفة
                    </span>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
                امسح الرمز المربع من هاتفك لبدء استقبال وإرسال الرسائل عبر رقمك الخاص.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center min-h-[380px]">
              
              {/* State 1: Initial Loading */}
              {loading ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700">جاري فحص الاتصال...</h3>
                    <p className="text-xs text-slate-400 mt-1">يتم التحقق من خادم المراسلة وحالة الربط الحالية</p>
                  </div>
                </div>
              ) : !data.serviceOnline ? (
                /* State 2: Service Offline */
                <div className="w-full max-w-md text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">خدمة الواتساب غير مشغلة</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      يعتمد ربط الواتساب على خادم محلي مدمج في المشروع. يرجى تشغيل الخدمة في الطرفية لبدء توليد الباركود.
                    </p>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-right font-mono text-xs shadow-inner flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden text-emerald-400">
                      <Terminal className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">npm run whatsapp</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCmd}
                      className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg gap-1.5"
                    >
                      {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCmd ? "تم النسخ" : "نسخ"}</span>
                    </Button>
                  </div>

                  <Button
                    onClick={() => fetchStatus(true)}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    إعادة فحص الاتصال الآن
                  </Button>
                </div>
              ) : data.status === "CONNECTED" ? (
                /* State 3: Connected Successfully */
                <div className="w-full text-center space-y-6 max-w-sm">
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900">رقمك متصل وجاهز للعمل</h3>
                    {data.info?.phone && (
                      <p className="font-mono text-emerald-600 font-bold dir-ltr mt-1 text-base">
                        +{data.info.phone}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      النظام متصل بجهازك. سيتم إرسال كافة التنبيهات والفواتير عبر هذا الرقم تلقائياً.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">الحالة التشغيلية:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      جاهز لإرسال الرسائل
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full h-11 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-xl font-bold gap-2 text-xs"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    قطع الاتصال / ربط رقم جديد
                  </Button>
                </div>
              ) : data.qrCode ? (
                /* State 4: QR Code Ready for Scanning */
                <div className="w-full flex flex-col items-center text-center space-y-6">
                  
                  {/* QR Image Box */}
                  <div className="relative group p-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-2 border-emerald-500/30">
                    <img 
                      src={data.qrCode} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl object-contain mx-auto" 
                    />
                    <div className="absolute inset-x-0 bottom-2 flex justify-center">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <QrCode className="w-3 h-3 text-emerald-400" />
                        يتجدد الرمز تلقائياً للحفاظ على الأمان
                      </span>
                    </div>
                  </div>

                  {/* Scan Instructions */}
                  <div className="space-y-3 max-w-md text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-emerald-600" />
                      طريقة الربط من هاتفك:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 pr-1 font-medium leading-relaxed">
                      <li>افتح تطبيق واتساب على هاتفك</li>
                      <li>اضغط على <strong>الإعدادات</strong> (أو القائمة الثلاثية ⋮)</li>
                      <li>اختر <strong>الأجهزة المرتبطة</strong> ثم <strong>ربط جهاز</strong></li>
                      <li>وجّه كاميرا هاتفك نحو الرمز المربع أعلاه</li>
                    </ol>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => fetchStatus(true)}
                    disabled={refreshing}
                    className="gap-2 h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    تحديث الرمز يدوياً
                  </Button>
                </div>
              ) : (
                /* State 5: Generating QR */
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">جاري إنشاء الباركود الجديد...</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      يتم الآن تشغيل محرك المتصفح وتوليد كود المصادقة الخاص بجلسة الواتساب. ثوانٍ معدودة وسيظهر الرمز.
                    </p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Test Messaging & Templates Section (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className={`border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white h-full flex flex-col transition-all duration-300 ${
            data.status !== "CONNECTED" ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}>
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-6">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-slate-800">
                <Send className="w-5 h-5 text-blue-600" />
                اختبار إرسال الرسائل
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500">
                أرسل رسالة تجريبية فورية للتحقق من سرعة وصول الرسائل إلى العملاء.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <form onSubmit={handleSendTest} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">رقم المستلم (مع مفتاح الدولة)</Label>
                  <Input 
                    dir="ltr" 
                    className="text-right h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500 font-mono text-sm" 
                    placeholder="+966500000000" 
                    required 
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400">مثال: +966512345678 أو +201000000000</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-bold text-xs sm:text-sm">نص الرسالة</Label>
                    <span className="text-[11px] text-slate-400">نماذج سريعة 👇</span>
                  </div>

                  {/* Fast message templates */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    <button
                      type="button"
                      onClick={() => setTemplate("مرحباً بك! هذه رسالة تجريبية لتأكيد نجاح ربط نظام المراسلة الآلي بنجاح 🚀")}
                      className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-2.5 py-1 rounded-lg transition-colors font-medium"
                    >
                      رسالة ترحيبية
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplate("عزيزي العميل، نود إعلامكم بصدور فاتورة جديدة رقم #INV-1001 بقيمة 1,500 ر.س.")}
                      className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 px-2.5 py-1 rounded-lg transition-colors font-medium"
                    >
                      إشعار فاتورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplate("تم تحديث حالة تذكرة الدعم الخاصة بك إلى (مكتملة). نشكر تواصلك معنا.")}
                      className="text-[11px] bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-600 px-2.5 py-1 rounded-lg transition-colors font-medium"
                    >
                      تحديث تذكرة
                    </button>
                  </div>

                  <textarea 
                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none leading-relaxed"
                    placeholder="اكتب رسالتك التجريبية هنا..."
                    required
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all gap-2" 
                  disabled={sending || data.status !== "CONNECTED"}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال الرسالة التجريبية
                    </>
                  )}
                </Button>
              </form>

              {data.status !== "CONNECTED" && (
                <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    قم بمسح الباركود وربط الجهاز أولاً لتفعيل إمكانية إرسال الرسائل الفورية والتلقائية.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
