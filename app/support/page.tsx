"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default function SupportPage() {
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, title, description }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const errText = await res.text();
        setError(errText === "Client not found" ? "رقم الواتساب غير مسجل لدينا، يرجى التأكد منه." : "حدث خطأ أثناء إرسال التذكرة.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center p-6 border-green-100 bg-green-50/50">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">تم استلام طلبك بنجاح!</h2>
          <p className="text-green-700">سيتم مراجعة طلبك والرد عليك عبر الواتساب في أقرب وقت.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">بوابة الدعم الفني</CardTitle>
          <CardDescription>يرجى إدخال تفاصيل طلبك ليتم معالجته بأسرع وقت.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الواتساب المسجل لدينا</Label>
              <Input
                id="phone"
                dir="ltr"
                className="text-right"
                placeholder="+966500000000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الطلب</Label>
              <Input
                id="title"
                placeholder="مثال: مشكلة في الدفع، تعديل بنر..."
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">تفاصيل الطلب</Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="اشرح طلبك بالتفصيل هنا..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 text-right">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال التذكرة"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
