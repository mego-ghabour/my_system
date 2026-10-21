"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white text-slate-900 font-sans">
      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative z-10 animate-in slide-in-from-right-8 duration-700">
        
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-2 text-center md:text-right">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-blue-500/30">
              <Activity className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">مرحباً بك مجدداً 👋</h1>
            <p className="text-slate-500 text-lg">سجل دخولك للوصول إلى لوحة التحكم الخاصة بك وإدارة أعمالك.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold">البريد الإلكتروني</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@freelance.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 px-4 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-right text-lg rounded-xl transition-all"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-bold">كلمة المرور</Label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">نسيت كلمة المرور؟</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 px-4 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-right text-lg rounded-xl tracking-widest transition-all"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 group" 
              disabled={loading}
            >
              {loading ? (
                "جاري التحقق..."
              ) : (
                <span className="flex items-center gap-2">
                  تسجيل الدخول
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Test Admin Button */}
          <div className="pt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">أو للتجربة السريعة</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 bg-white text-slate-700 hover:bg-slate-50 border-slate-200 border-2 rounded-xl font-bold transition-all"
            onClick={() => {
              setEmail("admin@freelance.com");
              setPassword("password123");
            }}
          >
            تعبئة بيانات الإدارة تلقائياً
          </Button>
        </div>
      </div>

      {/* Left Side: Visual / Decoration */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden items-center justify-center p-12">
        {/* Abstract Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/30 rounded-full blur-[100px] mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[100px] mix-blend-overlay"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 text-center text-white max-w-lg mx-auto animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 font-medium">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>نظام الإدارة الشامل</span>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6 tracking-tight text-right text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            أدر أعمالك وعملائك بذكاء وسهولة
          </h2>
          <p className="text-xl text-blue-100 font-medium text-right leading-relaxed opacity-90">
            نظام متكامل يجمع بين إدارة المهام، الفواتير، التذاكر، ودعم المساعد الذكي، بالإضافة إلى التكامل المباشر مع الواتساب لتواصل أسرع.
          </p>
        </div>
      </div>
    </div>
  );
}
