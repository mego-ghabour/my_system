"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tickets`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.id === resolvedParams.id);
        setTicket(found);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("تم تحديث حالة التذكرة");
        setTicket({ ...ticket, status: newStatus });
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">التذكرة غير موجودة</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/tickets">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight size={20} />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">تفاصيل التذكرة</h1>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
        <CardHeader className={`${
          ticket.status === 'OPEN' ? 'bg-red-50' :
          ticket.status === 'IN_PROGRESS' ? 'bg-orange-50' :
          'bg-green-50'
        } border-b border-slate-100 pb-6`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold mb-1 text-slate-600">
                مقدمة من: {ticket.client.name}
              </p>
              <CardTitle className="text-2xl font-bold text-slate-800 leading-normal">
                {ticket.title}
              </CardTitle>
            </div>
            <div className={`p-3 rounded-xl bg-white shadow-sm ${
              ticket.status === 'OPEN' ? 'text-red-500' :
              ticket.status === 'IN_PROGRESS' ? 'text-orange-500' :
              'text-green-500'
            }`}>
              {ticket.status === 'OPEN' ? <AlertCircle size={32} /> :
               ticket.status === 'IN_PROGRESS' ? <Clock size={32} /> :
               <CheckCircle2 size={32} />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-2">الوصف والتفاصيل:</h3>
            <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap text-lg border border-slate-100">
              {ticket.description}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-sm font-bold text-slate-800 mb-4">تغيير حالة التذكرة:</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => updateStatus('OPEN')}
                variant={ticket.status === 'OPEN' ? 'default' : 'outline'}
                className={ticket.status === 'OPEN' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 hover:bg-red-50 hover:text-red-700'}
              >
                مفتوحة (تحتاج رد)
              </Button>
              <Button 
                onClick={() => updateStatus('IN_PROGRESS')}
                variant={ticket.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                className={ticket.status === 'IN_PROGRESS' ? 'bg-orange-600 hover:bg-orange-700' : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'}
              >
                قيد المعالجة
              </Button>
              <Button 
                onClick={() => updateStatus('CLOSED')}
                variant={ticket.status === 'CLOSED' ? 'default' : 'outline'}
                className={ticket.status === 'CLOSED' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 hover:bg-green-50 hover:text-green-700'}
              >
                مغلقة (تم الحل)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
