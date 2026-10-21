"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  UserCircle, 
  KeyRound, 
  Sparkles, 
  Palette, 
  Store, 
  Database, 
  Check, 
  Save, 
  Loader2, 
  Globe, 
  Image as ImageIcon,
  Type,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PlatformsSettings } from "@/components/PlatformsSettings";

const AVAILABLE_FONTS = [
  { id: "Cairo", name: "خط كايرو (Cairo)", sample: "أبجد هوز حطي كلمن", desc: "الخط الافتراضي، عصري ومتزن" },
  { id: "Tajawal", name: "خط تجوال (Tajawal)", sample: "أبجد هوز حطي كلمن", desc: "انسيابي ومريح جداً للقراءة" },
  { id: "Almarai", name: "خط المراعي (Almarai)", sample: "أبجد هوز حطي كلمن", desc: "رسمي واحترافي للأنظمة" },
  { id: "IBM Plex Sans Arabic", name: "آي بي إم (IBM Plex)", sample: "أبجد هوز حطي كلمن", desc: "تقني، حاد وواضح للشاشات" },
  { id: "Readex Pro", name: "ريديكس برو (Readex Pro)", sample: "أبجد هوز حطي كلمن", desc: "هندسي ومودرن خفيف" },
];

export default function SettingsPage() {
  const { update } = useSession();
  const [activeTab, setActiveTab] = useState<"branding" | "account" | "platforms" | "ai" | "backup">("branding");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // User Settings
  const [userForm, setUserForm] = useState({
    name: "",
    avatarUrl: "",
    geminiKey: "",
    currentPassword: "",
    newPassword: "",
  });

  // Branding & Appearance Settings (Stored in localStorage and persistent)
  const [brandingForm, setBrandingForm] = useState({
    systemName: "النظام",
    logoUrl: "",
    faviconUrl: "",
    fontFamily: "Cairo",
    currency: "ر.س",
  });

  useEffect(() => {
    // 1. Load User Data
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setUserForm({
          name: data.name || "",
          avatarUrl: data.avatarUrl || "",
          geminiKey: data.geminiKey || "",
          currentPassword: "",
          newPassword: "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Load Branding Data
    if (typeof window !== "undefined") {
      setBrandingForm({
        systemName: localStorage.getItem("system_name") || "النظام",
        logoUrl: localStorage.getItem("system_logo") || "",
        faviconUrl: localStorage.getItem("system_favicon") || "",
        fontFamily: localStorage.getItem("system_font") || "Cairo",
        currency: localStorage.getItem("system_currency") || "ر.س",
      });
    }
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save User & AI Settings to DB
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "حدث خطأ أثناء حفظ بيانات المستخدم");
      }

      // 2. Save Branding Settings to LocalStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("system_name", brandingForm.systemName);
        localStorage.setItem("system_logo", brandingForm.logoUrl);
        localStorage.setItem("system_favicon", brandingForm.faviconUrl);
        localStorage.setItem("system_font", brandingForm.fontFamily);
        localStorage.setItem("system_currency", brandingForm.currency);

        // Dispatch event to re-render Sidebar and Theme Manager
        window.dispatchEvent(new Event("system_settings_updated"));
      }

      toast.success("تم حفظ وتطبيق جميع الإعدادات بنجاح! 🎉");
      setUserForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      update();
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleTestAi = async () => {
    if (!userForm.geminiKey.trim()) {
      toast.error("يرجى إدخال مفتاح Gemini API أولاً");
      return;
    }

    setTestingAi(true);
    setAiTestResult(null);

    try {
      // Save key first so the API route can use it
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userForm, currentPassword: "", newPassword: "" }),
      });

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "اختبار الاتصال: رد بكلمة واحدة فقط 'متصل'." }),
      });

      if (res.ok) {
        setAiTestResult({ success: true, message: "تم الاتصال بنجاح! مفتاح الذكاء الاصطناعي يعمل بشكل ممتاز." });
        toast.success("تم تأكيد عمل مفتاح Gemini بنجاح!");
      } else {
        const errText = await res.text();
        setAiTestResult({ success: false, message: `فشل الاتصال: ${errText}` });
        toast.error("فشل التحقق من المفتاح");
      }
    } catch {
      setAiTestResult({ success: false, message: "تعذر الاتصال بخادم الذكاء الاصطناعي" });
    } finally {
      setTestingAi(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      toast.info("جاري تجهيز النسخة الاحتياطية...");
      const [clientsRes, servicesRes, quotationsRes] = await Promise.all([
        fetch("/api/clients").then(r => r.json()).catch(() => []),
        fetch("/api/services").then(r => r.json()).catch(() => []),
        fetch("/api/quotations").then(r => r.json()).catch(() => []),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        systemName: brandingForm.systemName,
        clients: clientsRes,
        services: servicesRes,
        quotations: quotationsRes,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل النسخة الاحتياطية بنجاح!");
    } catch {
      toast.error("حدث خطأ أثناء تصدير البيانات");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400 gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 backdrop-blur-sm shadow-inner">
            <Palette className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              مركز الإعدادات والتخصيص
            </h1>
            <p className="text-slate-300 font-medium opacity-90">تحكم بالهوية البصرية، الشعار، نوع الخط، الأمان، ومفاتيح الذكاء الاصطناعي.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button 
            onClick={handleSaveAll} 
            disabled={saving} 
            className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 gap-2 text-md cursor-pointer"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "جاري الحفظ والتطبيق..." : "حفظ وتطبيق التغييرات"}
          </Button>
        </div>

        {/* Decorative blur elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation Tabs (UX Segmented Controls) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "branding"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Palette size={18} />
          الهوية والمظهر والخطوط
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "account"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <UserCircle size={18} />
          الحساب والأمان
        </button>

        <button
          onClick={() => setActiveTab("platforms")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "platforms"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Store size={18} />
          منصات المتاجر
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sparkles size={18} />
          الذكاء الاصطناعي (Gemini)
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "backup"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Database size={18} />
          النسخ الاحتياطي والبيانات
        </button>
      </div>

      {/* Tab 1: Branding & Appearance */}
      {activeTab === "branding" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe size={20} className="text-blue-500" />
                هوية المتجر / المؤسسة
              </CardTitle>
              <CardDescription>خصص الاسم، الشعار، والأيقونة لتظهر في القائمة الجانبية وعنوان المتصفح.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">اسم النظام / المؤسسة</Label>
                  <Input 
                    value={brandingForm.systemName}
                    onChange={e => setBrandingForm({ ...brandingForm, systemName: e.target.value })}
                    placeholder="مثال: متجر قمة التقنية"
                    className="h-12 rounded-xl text-sm"
                  />
                  <p className="text-xs text-slate-400">سيظهر هذا الاسم مباشرة في الترويسة والقائمة الجانبية.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">العملة الافتراضية</Label>
                  <Input 
                    value={brandingForm.currency}
                    onChange={e => setBrandingForm({ ...brandingForm, currency: e.target.value })}
                    placeholder="ر.س"
                    className="h-12 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                {/* Logo Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <ImageIcon size={16} />
                    رابط شعار المتجر (Logo URL)
                  </Label>
                  <Input 
                    dir="ltr"
                    value={brandingForm.logoUrl}
                    onChange={e => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="h-12 rounded-xl text-left font-mono text-sm"
                  />
                  {brandingForm.logoUrl && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <img src={brandingForm.logoUrl} alt="Preview" className="w-12 h-12 object-contain rounded-xl border border-slate-200 bg-white p-1" />
                      <span className="text-xs font-bold text-slate-600">معاينة الشعار الحالي</span>
                    </div>
                  )}
                </div>

                {/* Favicon Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Globe size={16} />
                    أيقونة الموقع (Favicon URL)
                  </Label>
                  <Input 
                    dir="ltr"
                    value={brandingForm.faviconUrl}
                    onChange={e => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                    className="h-12 rounded-xl text-left font-mono text-sm"
                  />
                  {brandingForm.faviconUrl && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <img src={brandingForm.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                      <span className="text-xs font-bold text-slate-600">معاينة أيقونة التبويب (Favicon)</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Font Selection */}
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Type size={20} className="text-blue-500" />
                اختيار خط النظام (Font Family)
              </CardTitle>
              <CardDescription>اختر الخط العربي المفضل للنظام، وسيتم تطبيقه فوراً على كامل الشاشات والجداول.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {AVAILABLE_FONTS.map(font => {
                  const isSelected = brandingForm.fontFamily === font.id;
                  return (
                    <div
                      key={font.id}
                      onClick={() => setBrandingForm({ ...brandingForm, fontFamily: font.id })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/40 shadow-md shadow-blue-500/10" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                      style={{ fontFamily: `'${font.id}', sans-serif` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-sm text-slate-800">{font.name}</span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-slate-900 my-2">{font.sample}</p>
                      <span className="text-[11px] text-slate-400 font-normal">{font.desc}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Account & Security */}
      {activeTab === "account" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserCircle size={20} className="text-blue-500" />
                معلومات الحساب والصورة الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0 space-y-2 text-center">
                  {userForm.avatarUrl ? (
                    <img src={userForm.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-4 border-slate-50 text-slate-400">
                      <UserCircle size={48} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-sm">الاسم الكامل</Label>
                      <Input 
                        value={userForm.name} 
                        onChange={e => setUserForm({ ...userForm, name: e.target.value })} 
                        className="h-12 rounded-xl" 
                        placeholder="اسمك الكامل" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                        <ImageIcon size={14}/> رابط الصورة الرمزية (Avatar URL)
                      </Label>
                      <Input 
                        value={userForm.avatarUrl} 
                        onChange={e => setUserForm({ ...userForm, avatarUrl: e.target.value })} 
                        dir="ltr" 
                        className="h-12 rounded-xl text-left" 
                        placeholder="https://..." 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-red-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-red-50/30 border-b border-red-50 p-6">
              <CardTitle className="text-lg font-bold text-red-700 flex items-center gap-2">
                <KeyRound size={20} />
                تغيير كلمة المرور والأمان
              </CardTitle>
              <CardDescription>اترك هذه الحقول فارغة إذا كنت لا ترغب في تغيير كلمة المرور.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-sm">كلمة المرور الحالية</Label>
                  <Input 
                    value={userForm.currentPassword} 
                    onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })} 
                    type="password" 
                    className="h-12 rounded-xl" 
                    placeholder="••••••••" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-sm">كلمة المرور الجديدة</Label>
                  <Input 
                    value={userForm.newPassword} 
                    onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })} 
                    type="password" 
                    className="h-12 rounded-xl" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Store Platforms */}
      {activeTab === "platforms" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PlatformsSettings />
        </div>
      )}

      {/* Tab 4: AI & Gemini */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    إعدادات الذكاء الاصطناعي (Google Gemini)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    قم بإدخال مفتاح الـ API لتشغيل المساعد الذكي وسؤاله عن فواتيرك وعملائك.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleTestAi}
                    disabled={testingAi || !userForm.geminiKey.trim()}
                    className="rounded-xl h-11 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold gap-2 cursor-pointer"
                  >
                    {testingAi ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    {testingAi ? "جاري الفحص..." : "اختبار الاتصال بالمفتاح"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">GEMINI_API_KEY</Label>
                <Input 
                  value={userForm.geminiKey} 
                  onChange={e => setUserForm({ ...userForm, geminiKey: e.target.value })} 
                  type="password" 
                  dir="ltr" 
                  className="h-12 rounded-xl text-left font-mono" 
                  placeholder="AIzaSy..." 
                />
                <p className="text-xs text-slate-400 mt-2">
                  يمكنك الحصول على مفتاح مجاني وسريع من{" "}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">
                    Google AI Studio
                  </a>.
                </p>
              </div>

              {aiTestResult && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                  aiTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  {aiTestResult.success ? <CheckCircle2 size={20} className="shrink-0 text-emerald-600" /> : <AlertCircle size={20} className="shrink-0 text-red-600" />}
                  <span className="text-sm font-bold">{aiTestResult.message}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Backup & Data */}
      {activeTab === "backup" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database size={20} className="text-blue-500" />
                تصدير البيانات والنسخ الاحتياطي
              </CardTitle>
              <CardDescription>قم بتنزيل نسخة كاملة من بيانات عملائك، فواتيرك، وخدماتك بصيغة JSON لحفظها بأمان.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">نسخة احتياطية كاملة (Full Backup)</h4>
                  <p className="text-xs text-slate-500">تشمل جميع العملاء، عروض الأسعار، والخدمات المسجلة في النظام.</p>
                </div>
                <Button 
                  onClick={handleExportBackup} 
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Download size={16} /> تنزيل ملف النسخة الاحتياطية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
