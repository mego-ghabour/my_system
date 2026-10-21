"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Save, Calculator } from "lucide-react";
import { toast } from "sonner";

export default function NewQuotationPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState([{ title: "", price: 0 }]);

  useEffect(() => {
    // Fetch clients
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setClients(data));

    // Fetch services
    fetch("/api/services")
      .then(res => res.json())
      .then(data => setServices(data));
  }, []);

  const total = items.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { title: "", price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price if service is selected
    if (field === "title") {
      const selectedService: any = services.find((s: any) => s.name === value);
      if (selectedService) {
        newItems[index].price = selectedService.basePrice;
      }
    }
    
    setItems(newItems);
  };

  const handleSaveQuotation = async () => {
    if (!selectedClient) {
      toast.error("الرجاء اختيار العميل");
      return;
    }
    if (items.some(i => !i.title || i.price <= 0)) {
      toast.error("الرجاء التأكد من إدخال جميع بنود العرض بشكل صحيح");
      return;
    }

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          items,
        }),
      });

      if (res.ok) {
        toast.success("تم إنشاء عرض السعر بنجاح!");
        router.push("/quotations");
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12 backdrop-blur-sm border border-white/10 transition-all hover:-translate-x-1 cursor-pointer"
          >
            <span className="rtl:rotate-180 text-xl font-bold">←</span>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mb-1.5">
              إنشاء عرض سعر جديد 🧾
            </h1>
            <p className="text-slate-300 font-medium opacity-90">حدد العميل وأضف الخدمات والأسعار ليتم حساب الإجمالي تلقائياً.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button 
            onClick={handleSaveQuotation} 
            className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 gap-2 text-md cursor-pointer"
          >
            <Save size={18} /> حفظ واعتماد العرض
          </Button>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* التفاصيل الأساسية والعميل */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-800">بيانات العميل</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">العميل الموجه له العرض <span className="text-red-500">*</span></label>
                <Select value={selectedClient} onValueChange={(val) => setSelectedClient(val || "")}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="اختر العميل..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer font-medium">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة الإجمالي الحية */}
          <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-blue-200 border border-white/10">
                <Calculator size={26} />
              </div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">الإجمالي المتوقع للعرض</p>
              <p className="text-5xl font-black tracking-tight">
                {total.toLocaleString()} <span className="text-lg font-normal text-blue-200">ر.س</span>
              </p>
              <div className="pt-2 border-t border-white/10 text-xs text-blue-200/80 font-medium">
                {items.length} {items.length === 1 ? "بند واحد" : items.length === 2 ? "بندان" : "بنود"} مسجلة
              </div>
            </CardContent>
          </Card>
        </div>

        {/* بنود عرض السعر */}
        <div className="md:col-span-2">
          <Card className="rounded-3xl border border-slate-100 shadow-sm h-full bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">بنود وتكاليف الخدمات</CardTitle>
                <p className="text-xs text-slate-400 mt-1">اختر من الخدمات الجاهزة أو اكتب بنوداً مخصصة مع السعر.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddItem} 
                className="gap-2 rounded-xl text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 font-bold h-10 px-4 cursor-pointer"
              >
                <Plus size={16} /> إضافة بند آخر
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 hover:border-blue-200 transition-colors">
                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-xs font-bold text-slate-600">اسم الخدمة / البند #{index + 1}</label>
                    <Input 
                      placeholder="مثال: تصميم وتجهيز متجر سلة..." 
                      value={item.title}
                      onChange={(e) => handleItemChange(index, "title", e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                      list="services-list"
                    />
                  </div>
                  <div className="w-full sm:w-36 space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">السعر (ر.س)</label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={item.price || ""}
                      onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                      className="h-12 rounded-xl border-slate-200 bg-white font-mono text-lg font-bold"
                    />
                  </div>
                  {items.length > 1 && (
                    <div className="sm:pt-6 self-end sm:self-auto">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-12 w-12 rounded-xl p-0 cursor-pointer"
                        title="حذف البند"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              <datalist id="services-list">
                {services.map((s: any) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleAddItem} 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-bold gap-1.5 cursor-pointer"
                >
                  <Plus size={16} /> إضافة بند جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
