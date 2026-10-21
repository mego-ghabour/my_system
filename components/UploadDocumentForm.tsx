"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function UploadDocumentForm({ clientId, storeId }: { clientId: string, storeId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentName) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", documentName);
    formData.append("file", file);
    if (storeId) formData.append("storeId", storeId);

    try {
      const res = await fetch(`/api/clients/${clientId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("تم رفع المستند بنجاح!");
        setDocumentName("");
        setFile(null);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء الرفع.");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-start">
        <DialogTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 gap-2 cursor-pointer shadow-sm">
          <UploadCloud size={16} /> رفع مستند جديد
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مستند جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">اسم المستند (مثال: الهوية الوطنية)</Label>
              <Input 
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">الملف (صور أو PDF)</Label>
              <Input 
                type="file" 
                accept="image/*,.pdf"
                className="cursor-pointer" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required 
              />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading || !file || !documentName}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            حفظ ورفع المستند
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
