import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordPaymentClient } from "@/components/RecordPaymentClient";

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedParams = await params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      items: true,
    }
  });

  if (!invoice) {
    return <div className="p-8 text-center text-red-500">الفاتورة غير موجودة</div>;
  }

  const remaining = invoice.total - invoice.paid;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link href="/financials">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowRight size={20} />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">تفاصيل الفاتورة</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card id="printable-invoice" className="p-8 bg-white print:shadow-none print:border-none">
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <h2 className="text-4xl font-black text-slate-800 mb-2">فاتورة</h2>
                <p className="text-slate-500 font-mono">#{invoice.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 mb-1">تاريخ الإصدار</p>
                <p className="font-bold">{new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(invoice.createdAt))}</p>
              </div>
            </div>

            <div className="mb-8 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">مُصدرة إلى السيد/ة:</p>
              <h3 className="text-xl font-bold text-slate-800">{invoice.client.name}</h3>
              {invoice.client.companyName && <p className="text-slate-600">{invoice.client.companyName}</p>}
              <p className="text-slate-600" dir="ltr">{invoice.client.phone}</p>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-right py-3 font-bold text-slate-700">الوصف</th>
                  <th className="text-right py-3 font-bold text-slate-700">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-4 font-medium">{item.title}</td>
                    <td className="py-4 font-bold">{item.price.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span>{invoice.total.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>المدفوع:</span>
                  <span>{invoice.paid.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-xl font-black text-red-600 border-t pt-3">
                  <span>المتبقي:</span>
                  <span>{remaining.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>
            
            {invoice.status === "PAID" && (
              <div className="mt-8 text-center p-4 border-2 border-emerald-500 rounded-xl text-emerald-600 font-black text-2xl rotate-[-5deg] opacity-80 w-64 mx-auto print:mt-16">
                خالص الدفع
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6 no-print">
          <Card>
            <CardHeader className="bg-slate-50 pb-4">
              <CardTitle className="text-lg">حالة الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                {invoice.status === "PAID" && <span className="inline-flex w-full justify-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200">مدفوعة بالكامل</span>}
                {invoice.status === "UNPAID" && <span className="inline-flex w-full justify-center px-4 py-2 bg-red-100 text-red-800 rounded-lg font-bold border border-red-200">غير مدفوعة</span>}
                {invoice.status === "PARTIAL" && <span className="inline-flex w-full justify-center px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200">دفعة جزئية</span>}
              </div>
            </CardContent>
          </Card>

          {remaining > 0 && (
            <RecordPaymentClient invoiceId={invoice.id} remaining={remaining} />
          )}
        </div>
      </div>
    </div>
  );
}
