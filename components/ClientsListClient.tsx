"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Search, Filter, MoreVertical, ArrowLeft, Building2, Wallet, 
  Store, FileText, CheckCircle2, Clock, Phone, Mail, 
  MapPin, Briefcase, MessageSquare, LayoutGrid, KanbanSquare, Star, Trash2, Pencil, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const STATUSES = [
  { id: "VIP", label: "VIP", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "ACTIVE", label: "نشط", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "LEAD", label: "محتمل", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "INACTIVE", label: "غير نشط", color: "bg-slate-100 text-slate-700 border-slate-200" },
];

export function ClientsListClient({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [debtFilter, setDebtFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);

  // Derive unique platforms from stores for the filter
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    clients.forEach(c => c.stores?.forEach((s: any) => s.platformName && platforms.add(s.platformName)));
    return Array.from(platforms);
  }, [clients]);

  // Filtering
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || client.phone.includes(search);
      const matchesStatus = statusFilter === "ALL" || client.status === statusFilter;
      
      let matchesDebt = true;
      if (debtFilter === "HAS_DEBT") {
        const totalDebt = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.total - inv.paid), 0) || 0;
        matchesDebt = totalDebt > 0;
      } else if (debtFilter === "NO_DEBT") {
        const totalDebt = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.total - inv.paid), 0) || 0;
        matchesDebt = totalDebt === 0;
      }

      let matchesPlatform = true;
      if (platformFilter !== "ALL") {
        matchesPlatform = client.stores?.some((s: any) => s.platformName === platformFilter);
      }

      return matchesSearch && matchesStatus && matchesDebt && matchesPlatform;
    }).sort((a, b) => {
      // Pinned clients always at top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [clients, search, statusFilter, debtFilter, platformFilter]);

  const displayedClients = filteredClients.slice(0, visibleCount);

  const calculateCompletion = (client: any) => {
    const fields = [
      client.name, client.phone, client.email, client.companyName, 
      client.taxId, client.address, (client.stores && client.stores.length > 0)
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const getStatusConfig = (statusId: string) => {
    return STATUSES.find(s => s.id === statusId) || STATUSES[1];
  };

  const togglePin = async (clientId: string, currentPin: boolean) => {
    // Optimistic update
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, isPinned: !currentPin } : c));
    try {
      await fetch(`/api/clients/${clientId}/pin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPin })
      });
    } catch (e) {
      toast.error("فشل تثبيت العميل");
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;
    setClients(prev => prev.filter(c => c.id !== clientId));
    try {
      await fetch(`/api/clients/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: [clientId] })
      });
      toast.success("تم الحذف");
    } catch (e) {
      toast.error("فشل الحذف");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} عملاء؟`)) return;
    setClients(prev => prev.filter(c => !selectedIds.includes(c.id)));
    const idsToDelete = [...selectedIds];
    setSelectedIds([]);
    try {
      await fetch(`/api/clients/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: idsToDelete })
      });
      toast.success("تم الحذف الجماعي بنجاح");
    } catch (e) {
      toast.error("فشل الحذف الجماعي");
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return; // Didn't change status

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setClients(prev => prev.map(c => c.id === draggableId ? { ...c, status: newStatus } : c));

    try {
      // Use PATCH to update status
      const res = await fetch(`/api/clients/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast.success("تم تحديث حالة العميل");
    } catch (e) {
      toast.error("فشل تحديث الحالة");
      // Revert on fail
      setClients(prev => prev.map(c => c.id === draggableId ? { ...c, status: source.droppableId } : c));
    }
  };

  const ClientCard = ({ client, index, isKanban = false }: any) => {
    const totalDebt = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.total - inv.paid), 0) || 0;
    const completion = calculateCompletion(client);
    const lastActive = client.activities?.[0]?.createdAt;
    
    const gradients = [
      "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
      "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
    ];
    const avatarGradient = gradients[client.name.length % gradients.length];
    const initials = client.name.substring(0, 2);
    const statusCfg = getStatusConfig(client.status);
    const isSelected = selectedIds.includes(client.id);

    return (
      <div className={`relative bg-white rounded-3xl shadow-sm border transition-all ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-100 hover:border-slate-300 hover:shadow-md'} overflow-hidden flex flex-col`}>
        
        {/* Top Controls: Checkbox & Pin */}
        <div className="flex justify-between items-center p-4 pb-0">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(c) => setSelectedIds(prev => c ? [...prev, client.id] : prev.filter(id => id !== client.id))}
            className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <button 
            onClick={() => togglePin(client.id, client.isPinned)}
            className={`p-1.5 rounded-full transition-colors ${client.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'}`}
          >
            <Star size={18} fill={client.isPinned ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="p-5 pt-2 flex-1">
          {/* Avatar and Info Row */}
          <div className="flex items-center gap-4 pr-2 mb-6">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner shrink-0"
              style={{ background: avatarGradient }}
            >
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-lg text-slate-800 truncate" title={client.name}>
                {client.name}
              </h3>
              <p className="text-sm font-mono text-slate-500 mt-1" dir="ltr" style={{ textAlign: 'right' }}>{client.phone}</p>
            </div>
          </div>

          {/* Stats & Progress */}
          <div className="space-y-4">
            {!isKanban && (
              <div className="flex items-center justify-between text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-1.5"><Store size={14} className="text-slate-400"/> المتاجر:</span>
                <span className="font-bold text-slate-800">{client.stores?.length || 0}</span>
              </div>
            )}
            
            {totalDebt > 0 && !isKanban && (
              <div className="flex items-center justify-between text-sm bg-red-50 p-2.5 rounded-xl border border-red-100 text-red-700 font-bold">
                <span>الديون المستحقة:</span>
                <span>{totalDebt.toLocaleString()} ريال</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>اكتمال الملف</span>
                <span className={completion === 100 ? 'text-emerald-600' : 'text-blue-600'}>{completion}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${completion === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Status & Date) */}
        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          {lastActive && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Clock size={12} /> {formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: ar })}
            </span>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <Link href={`/clients/${client.id}`} className="flex-1">
            <Button size="sm" className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded-xl transition-colors">
              فتح الملف
            </Button>
          </Link>
          <a href={`https://wa.me/${client.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
            <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
              <MessageSquare size={16} />
            </Button>
          </a>
          <Button size="icon" variant="outline" onClick={() => handleDelete(client.id)} className="h-9 w-9 rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-1 w-full gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="ابحث باسم العميل أو رقمه..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-slate-50 border-none h-11 focus-visible:ring-1 focus-visible:ring-slate-300 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-lg h-9 w-9 ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-lg h-9 w-9 ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              onClick={() => setViewMode('kanban')}
            >
              <KanbanSquare size={18} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Smart Segments */}
          <select 
            className="h-11 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">جميع الحالات</option>
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <select 
            className="h-11 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={debtFilter} onChange={(e) => setDebtFilter(e.target.value)}
          >
            <option value="ALL">حالة الديون (الكل)</option>
            <option value="HAS_DEBT">عليهم ديون</option>
            <option value="NO_DEBT">ليس عليهم ديون</option>
          </select>

          {availablePlatforms.length > 0 && (
            <select 
              className="h-11 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="ALL">المنصة (الكل)</option>
              {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-5">
          <span className="font-bold">{selectedIds.length} عملاء محددين</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSelectedIds([])} className="rounded-xl">إلغاء</Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="rounded-xl flex items-center gap-2">
              <Trash2 size={16}/> حذف المحدد
            </Button>
          </div>
        </div>
      )}

      {/* Views */}
      {viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedClients.map((client, i) => (
              <ClientCard key={client.id} client={client} index={i} />
            ))}
          </div>
          {visibleCount < filteredClients.length && (
            <div className="flex justify-center pt-8">
              <Button onClick={() => setVisibleCount(v => v + 20)} variant="outline" className="rounded-xl border-slate-200 h-12 px-8 text-slate-600 hover:bg-slate-50">
                عرض المزيد من العملاء
              </Button>
            </div>
          )}
        </>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
            {STATUSES.map(status => {
              const colClients = filteredClients.filter(c => (c.status || "ACTIVE") === status.id);
              return (
                <div key={status.id} className="min-w-[320px] w-[320px] shrink-0 bg-slate-50/50 border border-slate-100 rounded-3xl p-4 snap-center flex flex-col h-[calc(100vh-250px)]">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status.color.split(' ')[0]}`} />
                      {status.label}
                    </h3>
                    <span className="bg-white text-slate-500 text-xs font-bold px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                      {colClients.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={status.id}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto space-y-4 px-2 pb-4 scrollbar-hide"
                      >
                        {colClients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                                style={{...provided.draggableProps.style, transition: "transform 0.1s"}}
                              >
                                <ClientCard client={client} index={index} isKanban={true} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {filteredClients.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">لم يتم العثور على عملاء</h3>
          <p className="text-slate-500 mt-1">جرب تغيير الفلاتر أو كلمات البحث.</p>
        </div>
      )}
    </div>
  );
}
