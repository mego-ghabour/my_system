"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight, MessageSquare, CheckCircle2, Clock, FileText, Download } from "lucide-react";
import Link from "next/link";

export function PrintableQuotation({ quotation }: { quotation: any }) {
  const [systemName, setSystemName] = useState("النظام");
  const [systemLogo, setSystemLogo] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSystemName(localStorage.getItem("system_name") || "مؤسستنا التجارية");
      setSystemLogo(localStorage.getItem("system_logo") || "");
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const quoNumber = `QUO-${quotation.id.slice(-6).toUpperCase()}`;
  const clientPhone = quotation.client?.phone?.replace("+", "") || "";
  const whatsappMessage = encodeURIComponent(
    `مرحباً ${quotation.client?.name}،\nيسعدنا تقديم عرض السعر رقم #${quoNumber}.\nإجمالي العرض: ${quotation.total?.toLocaleString()} ر.س.\nشاكرين ومقدرين تعاملكم معنا.`
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <Link href="/quotations">
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 hover:bg-slate-200 h-10 w-10 cursor-pointer">
              <ArrowRight size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800">عرض سعر #{quoNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                quotation.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                quotation.status === "SENT" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>
                {quotation.status === "ACCEPTED" ? "معتمد ومقبول" : quotation.status === "SENT" ? "بانتظار الرد" : "مسودة"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">موجه للعميل: {quotation.client?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {clientPhone && (
            <a 
              href={`https://wa.me/${clientPhone}?text=${whatsappMessage}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 sm:flex-initial"
            >
              <Button className="w-full bg-[#25D366] hover:bg-[#1eb857] text-white font-bold h-11 px-5 rounded-2xl gap-2 shadow-sm cursor-pointer">
                <MessageSquare size={16} /> إرسال عبر واتساب
              </Button>
            </a>
          )}
          <Button 
            onClick={handlePrint} 
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-2xl gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Printer size={16} /> طباعة / تصدير PDF
          </Button>
        </div>
      </div>

      {/* Official Printable Sheet (A4-styled paper) */}
      <div 
        id="quotation-print-area" 
        className="bg-white p-8 md:p-14 rounded-3xl shadow-sm border border-slate-200/80 max-w-4xl mx-auto print:max-w-none print:w-full print:border-none print:shadow-none print:p-8 print:m-0"
      >
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-8 mb-8">
          <div className="space-y-2">
            {systemLogo ? (
              <img src={systemLogo} alt="Logo" className="h-16 w-auto object-contain mb-2" />
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                  {systemName.slice(0, 1)}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{systemName}</h2>
              </div>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">عرض سعر رسمي • OFFICIAL QUOTATION</p>
          </div>

          <div className="text-left space-y-1" dir="ltr">
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">#{quoNumber}</h3>
            <p className="text-xs font-bold text-slate-500">
              التاريخ: <span className="font-mono">{new Date(quotation.createdAt).toLocaleDateString("ar-SA")}</span>
            </p>
            <p className="text-xs font-bold text-slate-500">
              الصلاحية: <span className="font-mono">15 يوماً من تاريخه</span>
            </p>
          </div>
        </div>

        {/* Client & Provider Details */}
        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">بيانات العميل (الموجه إليه العرض):</p>
            <h4 className="text-base font-black text-slate-900">{quotation.client?.name}</h4>
            {quotation.client?.companyName && (
              <p className="text-xs font-bold text-slate-600">{quotation.client.companyName}</p>
            )}
            <p className="text-xs text-slate-600 font-mono" dir="ltr" style={{ textAlign: "right" }}>
              {quotation.client?.phone}
            </p>
            {quotation.client?.taxId && (
              <p className="text-xs text-slate-500">الرقم الضريبي: <span className="font-mono">{quotation.client.taxId}</span></p>
            )}
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">الجهة المصدرة للعرض:</p>
            <h4 className="text-base font-black text-slate-900">{systemName}</h4>
            <p className="text-xs text-slate-500">خدمات المتاجر الإلكترونية وحلول الويب</p>
            <p className="text-xs text-slate-500">الحالة: <span className="font-bold text-blue-600">عرض سعر سارٍ</span></p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-10">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-xs font-black uppercase">
                <th className="py-3 px-2 w-12 text-center">#</th>
                <th className="py-3 px-4">تفاصيل البند / الخدمة</th>
                <th className="py-3 px-4 text-left font-mono">السعر (ر.س)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {quotation.items && quotation.items.length > 0 ? (
                quotation.items.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-4 px-2 text-center font-mono font-bold text-slate-400 text-xs">{idx + 1}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{item.title}</td>
                    <td className="py-4 px-4 text-left font-mono font-black text-slate-900 text-base" dir="ltr">
                      {item.price?.toLocaleString()} ر.س
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">لا توجد بنود مسجلة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total & Summary Block */}
        <div className="flex justify-end mb-12">
          <div className="w-72 bg-slate-900 text-white p-6 rounded-2xl space-y-3 print:bg-slate-900">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-bold text-white">{quotation.total?.toLocaleString()} ر.س</span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              <span className="text-sm font-black text-white">الإجمالي النهائي:</span>
              <span className="text-2xl font-black text-blue-400 font-mono">
                {quotation.total?.toLocaleString()} <span className="text-xs text-slate-400">ر.س</span>
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Stamp Footer */}
        <div className="border-t border-slate-200 pt-8 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <h5 className="font-bold text-slate-800 mb-2">الشروط والأحكام:</h5>
            <ul className="space-y-1 list-disc list-inside leading-relaxed text-[11px]">
              <li>يعتبر هذا العرض نافذاً لمدة 15 يوماً من تاريخ التحرير.</li>
              <li>يبدأ العمل بعد اعتماد العرض وسداد الدفعة الأولى المتفق عليها.</li>
              <li>جميع الأسعار الموضحة بالريال السعودي.</li>
            </ul>
          </div>

          <div className="text-center flex flex-col justify-end items-center">
            <div className="w-36 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-[10px] mb-2">
              الختم والتوقيع الرسمي
            </div>
            <span className="font-bold text-slate-700">{systemName}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
