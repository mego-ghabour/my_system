"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 0 || pathname === "/dashboard") return null;

  const getLabel = (path: string) => {
    switch (path) {
      case "dashboard": return "لوحة التحكم";
      case "clients": return "العملاء";
      case "new": return "إضافة جديد";
      case "edit": return "تعديل";
      case "tasks": return "المهام";
      case "services": return "الخدمات";
      case "invoices": return "الفواتير";
      case "quotations": return "عروض الأسعار";
      case "financials": return "المالية";
      case "tickets": return "تذاكر الدعم";
      default: return path; // usually an ID, maybe shorten it or handle it in specific pages
    }
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium ml-4">
      <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
        <Home size={16} />
      </Link>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const href = "/" + paths.slice(0, index + 1).join("/");
        const label = getLabel(path);
        
        // Hide very long IDs from breadcrumbs to look cleaner
        if (path.length > 20) return null;

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronLeft size={14} className="text-slate-300" />
            {isLast ? (
              <span className="text-slate-800 font-bold">{label}</span>
            ) : (
              <Link href={href} className="hover:text-blue-600 transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
