"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function RecordPaymentClient({ invoiceId, remaining }: { invoiceId: string, remaining: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | "">("");

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    if (Number(amount) > remaining) {
      toast.error("المبلغ المدخل أكبر من المتبقي على الفاتورة");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) })
      });

      if (res.ok) {
        toast.success("تم تسجيل الدفعة بنجاح");
        setAmount("");
        router.refresh();
      } else {
        const err = await res.text();
        toast.error(err || "حدث خطأ أثناء تسجيل الدفعة");
      }
    } catch (e) {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-100 shadow-blue-100/50">
      <CardHeader className="bg-blue-50/50 pb-4">
        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
          <DollarSign size={18} />
          تسجيل دفعة جديدة
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label>المبلغ (ر.س)</Label>
          <Input 
            type="number" 
            min="1" 
            max={remaining}
            value={amount} 
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder={`المتبقي: ${remaining}`}
          />
        </div>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          onClick={handlePayment} 
          disabled={loading || !amount}
        >
          {loading && <Loader2 size={16} className="animate-spin ml-2" />}
          تأكيد الدفع
        </Button>
      </CardContent>
    </Card>
  );
}
