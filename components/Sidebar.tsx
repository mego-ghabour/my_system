"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, FileText, Briefcase, CreditCard, MessageSquare, LogOut, Settings, TicketIcon, Bot, ListTodo, Activity, FolderArchive } from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
  { name: "العملاء", href: "/clients", icon: Users },
  { name: "المالية", href: "/financials", icon: CreditCard },
  { name: "المهام", href: "/tasks", icon: ListTodo },
  { name: "الخدمات", href: "/services", icon: Briefcase },
  { name: "عروض الأسعار", href: "/quotations", icon: FileText },
  { name: "بيانات المؤسسة", href: "/assets", icon: FolderArchive },
  { name: "نظام التذاكر", href: "/tickets", icon: TicketIcon },
  { name: "الواتساب", href: "/whatsapp", icon: MessageSquare },
  { name: "المساعد الذكي", href: "/ai-assistant", icon: Bot },
  { name: "الإعدادات", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [systemName, setSystemName] = useState("النظام");
  const [systemLogo, setSystemLogo] = useState("");

  useEffect(() => {
    const loadBrand = () => {
      if (typeof window !== "undefined") {
        setSystemName(localStorage.getItem("system_name") || "النظام");
        setSystemLogo(localStorage.getItem("system_logo") || "");
      }
    };
    loadBrand();

    window.addEventListener("system_settings_updated", loadBrand);
    return () => window.removeEventListener("system_settings_updated", loadBrand);
  }, []);

  return (
    <div className="flex flex-col w-60 bg-white/80 backdrop-blur-xl border-l border-gray-100 h-screen fixed right-0 top-0 shadow-[0_0_40px_rgba(0,0,0,0.03)] z-50 transition-all duration-300">
      
      {/* Logo Section */}
      <div className="flex items-center justify-center py-8 px-6">
        <div className="flex items-center gap-3">
          {systemLogo ? (
            <img src={systemLogo} alt="Logo" className="w-10 h-10 rounded-xl object-contain shadow-sm border border-slate-100 bg-white" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="text-white w-6 h-6" />
            </div>
          )}
          <h2 className="text-xl font-black bg-gradient-to-l from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight truncate max-w-[140px]">
            {systemName}
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 overflow-y-auto scrollbar-hide pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? "text-white shadow-md shadow-blue-500/20" 
                  : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900"
              }`}
            >
              {/* Active Background Gradient */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100 transition-opacity"></div>
              )}
              
              <Icon 
                size={20} 
                className={`relative z-10 transition-transform duration-300 ${
                  isActive ? "text-white scale-110" : "text-gray-400 group-hover:text-blue-600 group-hover:scale-110"
                }`} 
              />
              <span className={`relative z-10 font-bold tracking-wide text-sm ${
                isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-100">
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-2xl text-red-500 font-bold bg-white border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
}
