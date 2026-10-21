"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Search, 
  Store, 
  Receipt, 
  Bot, 
  TicketIcon, 
  FileText, 
  Briefcase, 
  ListTodo, 
  Settings, 
  ArrowLeft,
  Loader2,
  Tag
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    clients: any[];
    services: any[];
    tickets: any[];
    quotations: any[];
  }>({ clients: [], services: [], tickets: [], quotations: [] });

  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch search results whenever query changes or menu opens
  React.useEffect(() => {
    if (!open) return;

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [query, open]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 bg-slate-100/80 border border-slate-200/80 rounded-full hover:bg-slate-200/60 transition-all shadow-inner w-64 md:w-72 cursor-pointer"
      >
        <Search size={16} className="text-slate-400" />
        <span className="text-slate-500 text-xs">بحث سريع عن عميل أو فاتورة...</span>
        <kbd className="mr-auto font-mono text-[10px] bg-white border border-slate-200 shadow-xs px-2 py-0.5 rounded-full text-slate-400 font-bold">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput 
            placeholder="ابحث بالاسم، برقم الجوال، أو الخدمة..." 
            value={query}
            onValueChange={setQuery}
          />
          {loading && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
            </div>
          )}
        </div>

        <CommandList className="max-h-96">
          <CommandEmpty>لم يتم العثور على أي نتائج مطابقة.</CommandEmpty>

          {/* Dynamic Clients Results */}
          {results.clients && results.clients.length > 0 && (
            <CommandGroup heading="العملاء المسجلون">
              {results.clients.map((client) => (
                <CommandItem
                  key={`client-${client.id}`}
                  value={`${client.name} ${client.phone} ${client.companyName || ""}`}
                  onSelect={() => runCommand(() => router.push(`/clients/${client.id}`))}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{client.name}</div>
                      <div className="text-slate-400 text-xs font-mono">{client.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.companyName && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {client.companyName}
                      </span>
                    )}
                    <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                      فتح الملف <ArrowLeft size={12} className="rtl:-scale-x-100" />
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Dynamic Quotations Results */}
          {results.quotations && results.quotations.length > 0 && (
            <CommandGroup heading="عروض الأسعار">
              {results.quotations.map((quote) => (
                <CommandItem
                  key={`quote-${quote.id}`}
                  value={`عرض سعر ${quote.client?.name || ""} ${quote.total}`}
                  onSelect={() => runCommand(() => router.push(`/quotations`))}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">عرض سعر لـ {quote.client?.name}</div>
                      <div className="text-slate-400 text-xs">{quote.total.toLocaleString()} ر.س</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600">عروض الأسعار</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Dynamic Services Results */}
          {results.services && results.services.length > 0 && (
            <CommandGroup heading="دليل الخدمات">
              {results.services.map((service) => (
                <CommandItem
                  key={`service-${service.id}`}
                  value={`${service.name} ${service.basePrice}`}
                  onSelect={() => runCommand(() => router.push(`/services`))}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{service.name}</div>
                      <div className="text-emerald-600 font-bold text-xs">{service.basePrice} ر.س</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">خدمة</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading="إجراءات سريعة">
            <CommandItem onSelect={() => runCommand(() => router.push("/clients/new"))} className="p-2.5 cursor-pointer">
              <User className="ml-2 h-4 w-4 text-blue-600" />
              <span>إضافة عميل جديد</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/quotations/new"))} className="p-2.5 cursor-pointer">
              <FileText className="ml-2 h-4 w-4 text-amber-600" />
              <span>إنشاء عرض سعر جديد</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tasks"))} className="p-2.5 cursor-pointer">
              <ListTodo className="ml-2 h-4 w-4 text-emerald-600" />
              <span>إدارة قائمة المهام</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/ai-assistant"))} className="p-2.5 cursor-pointer">
              <Bot className="ml-2 h-4 w-4 text-indigo-600" />
              <span>مساعد الذكاء الاصطناعي</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* System Pages */}
          <CommandGroup heading="أقسام النظام">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))} className="p-2.5 cursor-pointer">
              <Store className="ml-2 h-4 w-4" />
              <span>لوحة التحكم الرئيسية</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/financials"))} className="p-2.5 cursor-pointer">
              <Receipt className="ml-2 h-4 w-4" />
              <span>المالية والديون</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tickets"))} className="p-2.5 cursor-pointer">
              <TicketIcon className="ml-2 h-4 w-4" />
              <span>تذاكر الدعم الفني</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))} className="p-2.5 cursor-pointer">
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات والتخصيص</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
