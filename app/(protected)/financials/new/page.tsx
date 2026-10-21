"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Client = { id: string; name: string };
type Service = { id: string; name: string; basePrice: number };

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState([{ title: "", price: 0 }]);
  const [paid, setPaid] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]).then(([clientsData, servicesData]) => {
      setClients(clientsData);
      setServices(servicesData);
      setLoading(false);
    });
  }, []);

  const total = items.reduce((acc, item) => acc + (item.price || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { title: "", price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "serviceId") {
      const srv = services.find((s) => s.id === value);
      if (srv) {
        newItems[index] = { title: srv.name, price: srv.basePrice };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || items.length === 0) {
      toast.error("يرجى اختيار العميل وإضافة عنصر واحد على الأقل للفاتورة.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          items,
          total,
          paid,
        }),
      });

      if (res.ok) {
        toast.success("تم إصدار الفاتورة بنجاح 🎉");
        setSuccess(true);
        setTimeout(() => {
          router.push("/financials");
          router.refresh();
        }, 1500);
      } else {
        const errorText = await res.text();
        toast.error(errorText || "حدث خطأ أثناء الحفظ");
      }
    } catch (err) {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6 border-green-100 bg-green-50/50">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">تم إصدار الفاتورة بنجاح!</h2>
          <p className="text-green-700">سيتم تحويلك إلى صفحة المالية...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إنشاء فاتورة جديدة</h1>
        <p className="text-gray-500">اختر العميل وأضف الخدمات لحساب الإجمالي وإصدار الفاتورة.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              required
            >
              <option value="">-- اختر العميل --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>عناصر الفاتورة (الخدمات)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
              <Plus size={16} /> إضافة عنصر
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Label>اسم الخدمة</Label>
                  {services.length > 0 ? (
                    <div className="flex gap-2">
                      <select 
                        className="flex h-10 w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => updateItem(index, "serviceId", e.target.value)}
                      >
                        <option value="">-- اختر من الخدمات --</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <Input 
                        className="w-1/2"
                        placeholder="أو اكتب وصفاً مخصصاً..."
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <Input 
                      placeholder="اكتب وصف الخدمة..."
                      value={item.title}
                      onChange={(e) => updateItem(index, "title", e.target.value)}
                      required
                    />
                  )}
                </div>
                <div className="w-32 space-y-2">
                  <Label>السعر (ر.س)</Label>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash size={16} />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>المالية والتسديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg text-lg font-bold">
              <span>الإجمالي:</span>
              <span className="text-blue-700">{total} ر.س</span>
            </div>

            <div className="space-y-2">
              <Label>المبلغ المدفوع مقدماً (إذا وجد)</Label>
              <Input 
                type="number"
                min="0"
                max={total}
                step="0.01"
                value={paid}
                onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
              />
            </div>

            {total - paid > 0 && (
              <div className="flex justify-between items-center p-4 bg-red-50 text-red-700 rounded-lg font-bold mt-2 border border-red-100">
                <span>المتبقي (دين على العميل):</span>
                <span>{total - paid} ر.س</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="pt-4 flex gap-4">
          <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="lg" disabled={saving}>
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? "جاري الإصدار..." : "حفظ وإصدار الفاتورة"}
          </Button>
          <Link href="/financials" className="w-full">
            <Button type="button" variant="outline" size="lg" className="w-full">
              إلغاء
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
