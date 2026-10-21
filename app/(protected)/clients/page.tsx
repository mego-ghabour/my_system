import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, Sparkles } from "lucide-react";
import { ClientsListClient } from "@/components/ClientsListClient";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      services: true,
      invoices: true,
      stores: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 backdrop-blur-sm shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              إدارة العملاء
              <Sparkles className="w-6 h-6 text-blue-400" />
            </h1>
            <p className="text-slate-300 font-medium opacity-90">تتبع وإدارة تفاصيل عملائك، حساباتهم، وخدماتهم في مكان واحد.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/clients/new">
            <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 gap-2 text-md">
              <Plus className="w-5 h-5" />
              إضافة عميل جديد
            </Button>
          </Link>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <ClientsListClient initialClients={clients} />
    </div>
  );
}
