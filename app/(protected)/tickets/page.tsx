import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, TicketIcon, CheckCircle2, Clock, AlertCircle, Sparkles, LifeBuoy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              الدعم الفني والتذاكر
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-gray-500 font-medium mt-1">تتبع طلبات ومشاكل العملاء وتحديث حالتها بشكل مستمر.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {openTicketsCount > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{openTicketsCount} تذاكر مفتوحة</span>
            </div>
          )}
          <Link href="/tickets/new">
            <Button className="h-12 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1 gap-2 text-md">
              <Plus className="w-5 h-5" />
              تذكرة جديدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-6 delay-200">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-2xl flex items-center justify-center transition-colors ${
                    ticket.status === 'OPEN' ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' :
                    'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                  }`}>
                    {ticket.status === 'OPEN' ? <AlertCircle size={24} /> :
                     ticket.status === 'IN_PROGRESS' ? <Clock size={24} /> :
                     <CheckCircle2 size={24} />}
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">{ticket.title}</h3>
                </div>
                <p className="text-sm text-slate-500 pr-14 line-clamp-2 leading-relaxed">{ticket.description}</p>
                <div className="flex items-center gap-6 pr-14 mt-4 text-xs font-bold text-slate-400">
                  <Link href={`/clients/${ticket.clientId}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1 rounded-lg">
                    <span className="text-base">👤</span> {ticket.client.name}
                  </Link>
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📅</span> {new Date(ticket.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                <span className={`px-4 py-2.5 rounded-xl text-sm font-bold border ${
                  ticket.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-100' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                  'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {ticket.status === 'OPEN' ? 'مفتوحة (تحتاج رد)' :
                   ticket.status === 'IN_PROGRESS' ? 'قيد المعالجة' :
                   'مغلقة (تم الحل)'}
                </span>
                
                <Link href={`/tickets/${ticket.id}`}>
                  <Button variant="outline" className="rounded-xl h-11 px-6 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                    عرض التذكرة
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <TicketIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد تذاكر دعم فني حتى الآن</h3>
            <p className="text-slate-500">عندما يواجه عملاؤك مشكلة، ستظهر تذاكرهم هنا.</p>
          </div>
        )}
      </div>
    </div>
  );
}
