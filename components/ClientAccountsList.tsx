"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, Key, Link as LinkIcon, Lock, Pencil, Save, Trash2, User, X } from "lucide-react";
import { toast } from "sonner";
import { AddAccountForm } from "./AddAccountForm";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ClientAccountsList({ clientId, accounts, storeId }: { clientId: string, accounts: any[], storeId?: string }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleEditClick = (acc: any) => {
    setEditingId(acc.id);
    setEditForm({
      name: acc.name || "",
      username: acc.username || "",
      password: acc.password || "",
      link: acc.link || "",
    });
  };

  const handleSaveEdit = async (accountId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/accounts/${accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("تم تحديث الحساب بنجاح!");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء التحديث.");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم.");
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;
    setDeletingId(accountId);

    try {
      const res = await fetch(`/api/clients/${clientId}/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("تم الحذف بنجاح!");
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء الحذف.");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
            <User className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-500 font-medium text-sm">لا توجد حسابات خارجية مسجلة للعميل حتى الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TooltipProvider>
          {accounts.map((acc) => {
            const isEditing = editingId === acc.id;
            return (
            <Card key={acc.id} className={`border-none shadow-sm transition-all duration-300 ${isEditing ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'} overflow-hidden group`}>
              {isEditing ? (
                <CardContent className="p-5 space-y-4 bg-blue-50/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">اسم التطبيق/المنصة</label>
                      <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">رابط الدخول</label>
                      <Input value={editForm.link} onChange={e => setEditForm({...editForm, link: e.target.value})} dir="ltr" className="bg-white text-left" placeholder="https://" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">اسم المستخدم/الإيميل</label>
                      <Input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} dir="ltr" className="bg-white text-left" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">كلمة المرور</label>
                      <Input value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} dir="ltr" className="bg-white text-left font-mono" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-blue-100 mt-2">
                    <Button size="sm" variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => setEditingId(null)}>إلغاء</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => handleSaveEdit(acc.id)}>حفظ التعديلات</Button>
                  </div>
                </CardContent>
              ) : (
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                        {acc.link ? <LinkIcon size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{acc.name}</h3>
                        {acc.link && (
                          <a href={acc.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors mt-0.5">
                            زيارة الرابط <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleEditClick(acc)}>
                          <Pencil size={14} />
                        </TooltipTrigger>
                        <TooltipContent>تعديل</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50" onClick={() => handleDelete(acc.id)} disabled={deletingId === acc.id}>
                          <Trash2 size={14} />
                        </TooltipTrigger>
                        <TooltipContent>حذف</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User size={14} />
                        <span>المستخدم:</span>
                      </div>
                      <span className="font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm" dir="ltr">
                        {acc.username || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Lock size={14} />
                        <span>كلمة المرور:</span>
                      </div>
                      <span className="font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm" dir="ltr">
                        {acc.password || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )})}
          </TooltipProvider>
        </div>
      )}

      <AddAccountForm clientId={clientId} storeId={storeId} />
    </div>
  );
}
