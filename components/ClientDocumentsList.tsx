"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Save, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { UploadDocumentForm } from "./UploadDocumentForm";
import { Input } from "@/components/ui/input";

export function ClientDocumentsList({ clientId, documents, storeId }: { clientId: string, documents: any[], storeId?: string }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleEditClick = (doc: any) => {
    setEditingId(doc.id);
    setEditName(doc.name);
  };

  const handleSaveEdit = async (docId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (res.ok) {
        toast.success("تم تحديث اسم المستند بنجاح");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء التحديث.");
      }
    } catch (error) {
      toast.error("تعذر الاتصال بالخادم.");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستند؟")) return;
    setDeletingId(docId);

    try {
      const res = await fetch(`/api/clients/${clientId}/documents/${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("تم الحذف بنجاح!");
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء الحذف.");
      }
    } catch (error) {
      toast.error("تعذر الاتصال بالخادم.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-2">لا توجد ملفات مرفقة.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {documents.map((doc) => {
            const isEditing = editingId === doc.id;
            return (
            <li key={doc.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border">
              {isEditing ? (
                <div className="flex gap-2 w-full">
                  <Input 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="h-8 text-sm" 
                  />
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingId(null)}><X size={14}/></Button>
                  <Button size="icon" className="h-8 w-8 bg-blue-600" onClick={() => handleSaveEdit(doc.id)}><Save size={14}/></Button>
                </div>
              ) : (
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-blue-500 shrink-0" />
                    <span className="font-medium text-slate-700 text-sm truncate">{doc.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0 mr-2">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md text-xs font-medium">
                      عرض
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500 hover:text-blue-600 h-7 w-7"
                      onClick={() => handleEditClick(doc)}
                    >
                      <Edit size={12} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )})}
        </ul>
      )}

      <UploadDocumentForm clientId={clientId} storeId={storeId} />
    </div>
  );
}
