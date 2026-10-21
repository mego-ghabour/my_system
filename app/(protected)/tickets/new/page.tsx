"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NewTicketPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/clients").then(res => res.json()).then(setClients);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return toast.error("الرجاء اختيار العميل");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, title, description }),
      });

      if (res.ok) {
        toast.success("تم فتح التذكرة بنجاح");
        router.push("/tickets");
        router.refresh();
      } else {
        const err = await res.text();
        toast.error(err || "حدث خطأ");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/tickets">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight size={20} />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">تذكرة دعم جديدة</h1>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-100">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">العميل</label>
              <Select value={clientId} onValueChange={(val) => setClientId(val || "")} required>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="اختر العميل المعني بالتذكرة" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">عنوان التذكرة (المشكلة)</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="h-12 rounded-xl"
                placeholder="مثال: الموقع لا يعمل، تعديل لون..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">تفاصيل المشكلة (الوصف)</label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="rounded-xl min-h-[150px]"
                placeholder="اشرح المشكلة أو التعديل المطلوب بالتفصيل..."
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white mt-4 gap-2">
              <Save size={18} />
              فتح التذكرة
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
