"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Receipt, CreditCard } from "lucide-react";

import { useRouter } from "next/navigation";

export function FinancialsListClient({ initialInvoices }: { initialInvoices: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = initialInvoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const shortId = inv.id.slice(-6).toLowerCase();
    const clientName = inv.client?.name?.toLowerCase() || "";
    
    return shortId.includes(q) || clientName.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="بحث برقم الفاتورة أو اسم العميل..." 
            className="pl-4 pr-10 h-12 rounded-xl bg-white border-slate-200 focus:border-blue-500 transition-colors shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Receipt size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-700">لم يتم العثور على فواتير</p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-blue-600">
                مسح البحث
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-right py-4 font-bold text-slate-700">الفاتورة</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">العميل</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">الإجمالي</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">المدفوع</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">المتبقي</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">الحالة</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">التاريخ</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-700">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <TableCell className="py-4">
                    <div className="font-mono text-sm text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">
                      #{invoice.id.slice(-6).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-bold text-slate-800">{invoice.client?.name}</TableCell>
                  <TableCell className="py-4 font-medium">{invoice.total.toLocaleString()} ر.س</TableCell>
                  <TableCell className="py-4 font-medium text-emerald-600">{invoice.paid.toLocaleString()} ر.س</TableCell>
                  <TableCell className="py-4 font-bold text-red-500">
                    {(invoice.total - invoice.paid).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="py-4">
                    {invoice.status === "PAID" && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">مدفوعة بالكامل</span>}
                    {invoice.status === "UNPAID" && <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">غير مدفوعة</span>}
                    {invoice.status === "PARTIAL" && <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">دفعة جزئية</span>}
                  </TableCell>
                  <TableCell className="py-4 text-slate-500 text-sm font-medium">
                    {new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(invoice.createdAt))}
                  </TableCell>
                  <TableCell className="py-4">
                    <Link href={`/financials/${invoice.id}`}>
                      <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50">
                        التفاصيل
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
