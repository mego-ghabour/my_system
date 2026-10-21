"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ReceiptText, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function ClientWalletCard({ client, transactions = [] }: { client: any, transactions: any[] }) {
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("CREDIT"); // CREDIT (Deposit), DEBIT (Withdrawal/Deduction)

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), type, notes }),
      });

      if (res.ok) {
        toast.success("تم التحديث بنجاح!");
        setAmount("");
        setNotes("");
        setOpenAdd(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء التحديث.");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm relative overflow-hidden rounded-3xl animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      
      <CardHeader className="pb-3 relative z-10 border-b border-blue-100/50 bg-blue-100/20">
        <CardTitle className="text-blue-900 flex items-center gap-2 text-lg">
          محفظة العميل
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-6">
        <p className="text-sm text-blue-700/70 mb-1 font-medium">الرصيد المتوفر</p>
        <p className="text-3xl font-black text-blue-900" suppressHydrationWarning>
          {(client.walletBalance || 0).toLocaleString('en-US')} <span className="text-lg font-bold text-blue-700">ر.س</span>
        </p>
        
        <div className="mt-6 flex flex-col gap-3">
          {/* Add Balance Dialog */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 text-white font-bold h-11 rounded-xl gap-2 transition-all hover:scale-[1.02] inline-flex items-center justify-center cursor-pointer">
              <Plus size={18} />
              إضافة / خصم رصيد
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>التحكم برصيد المحفظة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBalance} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${type === 'CREDIT' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                    onClick={() => setType('CREDIT')}
                  >
                    <ArrowDownToLine size={24} className="mb-2" />
                    <span className="font-bold text-sm">إيداع (إضافة رصيد)</span>
                  </div>
                  <div 
                    className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${type === 'DEBIT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                    onClick={() => setType('DEBIT')}
                  >
                    <ArrowUpFromLine size={24} className="mb-2" />
                    <span className="font-bold text-sm">خصم (سحب رصيد)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>المبلغ (ر.س)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0.1"
                    required 
                    dir="ltr"
                    className="text-right h-12 text-lg font-bold"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>السبب / ملاحظات (اختياري)</Label>
                  <Input 
                    placeholder="مثال: دفعة مقدمة لتجديد الاشتراك"
                    className="h-11"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                <Button type="submit" disabled={loading} className={`w-full h-12 text-lg font-bold mt-2 ${type === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {loading ? <Loader2 className="animate-spin" /> : 'تأكيد العملية'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* History Dialog */}
          <Dialog open={openHistory} onOpenChange={setOpenHistory}>
            <DialogTrigger className="w-full bg-white/60 hover:bg-white text-blue-700 border border-blue-200 font-bold h-11 rounded-xl gap-2 transition-all inline-flex items-center justify-center cursor-pointer">
              <ReceiptText size={18} />
              سجل عمليات المحفظة
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>سجل عمليات المحفظة</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-medium">لا توجد عمليات سابقة.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'CREDIT' ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{tx.type === 'CREDIT' ? 'إيداع رصيد' : 'خصم رصيد'}</p>
                          <p className="text-[11px] text-slate-500">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ar })}</p>
                          {tx.notes && <p className="text-xs text-slate-600 mt-1">{tx.notes}</p>}
                        </div>
                      </div>
                      <div className={`font-black whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} ر.س
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
