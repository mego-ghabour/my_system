"use client";

import { useState } from "react";
import { Store, Pencil, Trash2, ExternalLink, Mail, Key, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddStoreForm } from "./AddStoreForm";
import { ClientAccountsList } from "./ClientAccountsList";
import { ClientDocumentsList } from "./ClientDocumentsList";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export function ClientStoresList({ clientId, stores, accounts, documents, platforms = [] }: { clientId: string, stores: any[], accounts: any[], documents: any[], platforms?: any[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(stores[0]?.id || null);
  const [editForm, setEditForm] = useState({ name: "", platformName: "", storeLink: "", platformEmail: "", platformPassword: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEditClick = (store: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(store.id);
    if (expandedId !== store.id) setExpandedId(store.id);
    setEditForm({
      name: store.name || "",
      platformName: store.platformName || "",
      storeLink: store.storeLink || "",
      platformEmail: store.platformEmail || "",
      platformPassword: store.platformPassword || "",
    });
  };

  const handleSaveEdit = async (storeId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("تم تحديث بيانات المتجر!");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء التحديث.");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم.");
    }
  };

  const handleDelete = async (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذا المتجر؟ سيتم حذف جميع حساباته ومستنداته المرتبطة به!")) return;
    setDeletingId(storeId);

    try {
      const res = await fetch(`/api/clients/${clientId}/stores/${storeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("تم حذف المتجر بنجاح!");
        if (expandedId === storeId) setExpandedId(null);
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
      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
            <Store className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-500 font-medium text-sm">لم يتم إضافة متاجر إلكترونية لهذا العميل.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TooltipProvider>
          {stores.map((store, index) => {
            const isEditing = editingId === store.id;
            const isExpanded = expandedId === store.id;
            const storeAccounts = accounts.filter(a => a.storeId === store.id);
            const storeDocuments = documents.filter(d => d.storeId === store.id);

            return (
            <div key={store.id} className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${isExpanded ? 'border-emerald-200 bg-emerald-50/20 shadow-md' : 'border-slate-100 bg-white hover:border-emerald-100'}`}>
              {/* Header (Clickable for Accordion) */}
              <div 
                className={`p-4 ${isExpanded ? 'bg-white border-b border-emerald-100/50' : ''} cursor-pointer transition-colors hover:bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                onClick={() => !isEditing && setExpandedId(isExpanded ? null : store.id)}
              >
                {isEditing ? (
                  <div className="space-y-4 w-full" onClick={e => e.stopPropagation()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-600">اسم المتجر</label>
                        <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-white h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">المنصة</label>
                        {platforms.length > 0 ? (
                          <select 
                            className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={editForm.platformName} 
                            onChange={e => setEditForm({...editForm, platformName: e.target.value})}
                          >
                            <option value="">غير محدد</option>
                            {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        ) : (
                          <Input value={editForm.platformName} onChange={e => setEditForm({...editForm, platformName: e.target.value})} className="bg-white h-9" />
                        )}
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-600">رابط المتجر</label>
                        <Input value={editForm.storeLink} onChange={e => setEditForm({...editForm, storeLink: e.target.value})} dir="ltr" className="bg-white text-left h-9" placeholder="https://" />
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-600">إيميل الدخول</label>
                        <Input value={editForm.platformEmail} onChange={e => setEditForm({...editForm, platformEmail: e.target.value})} dir="ltr" className="bg-white text-left h-9" />
                      </div>
                      <div className="space-y-1.5 lg:col-span-3">
                        <label className="text-xs font-bold text-slate-600">كلمة المرور</label>
                        <Input value={editForm.platformPassword} onChange={e => setEditForm({...editForm, platformPassword: e.target.value})} dir="ltr" className="bg-white text-left font-mono h-9" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => setEditingId(null)}>إلغاء</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleSaveEdit(store.id)}>حفظ التعديلات</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isExpanded ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}>
                        <Store size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-800">{store.name || `متجر ${index + 1}`}</h3>
                          {store.platformName && (
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <Tag size={10} /> {store.platformName}
                            </span>
                          )}
                        </div>
                        {store.storeLink && (
                          <a href={store.storeLink} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors mt-0.5" onClick={e => e.stopPropagation()}>
                            فتح رابط المتجر <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex items-center gap-4 text-sm bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 overflow-hidden max-w-full">
                        <div className="flex items-center gap-2 truncate">
                          <Mail size={14} className="text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700 truncate">{store.platformEmail || '-'}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 shrink-0"></div>
                        <div className="flex items-center gap-2 truncate">
                          <Key size={14} className="text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700 truncate">{store.platformPassword || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-auto md:ml-0">
                        <Tooltip>
                          <TooltipTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" onClick={(e) => handleEditClick(store, e)}>
                            <Pencil size={16} />
                          </TooltipTrigger>
                          <TooltipContent>تعديل بيانات المتجر</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50" onClick={(e) => handleDelete(store.id, e)} disabled={deletingId === store.id}>
                            <Trash2 size={16} />
                          </TooltipTrigger>
                          <TooltipContent>حذف المتجر بالكامل</TooltipContent>
                        </Tooltip>
                        
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors">
                          {isExpanded ? <ChevronUp size={20} className="text-emerald-600" /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Store Inner Content: Accounts & Documents (Collapsible) */}
              {isExpanded && !isEditing && (
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="bg-white p-4 rounded-xl border border-emerald-50 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      حسابات وتطبيقات {store.name}
                    </h4>
                    <ClientAccountsList clientId={clientId} accounts={storeAccounts} storeId={store.id} />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-50 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      مستندات وملفات {store.name}
                    </h4>
                    <ClientDocumentsList clientId={clientId} documents={storeDocuments} storeId={store.id} />
                  </div>
                </div>
              )}

            </div>
          )})}
          </TooltipProvider>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <AddStoreForm clientId={clientId} platforms={platforms} />
      </div>
    </div>
  );
}
