"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, TicketIcon, ListTodo, FileText, Receipt, RefreshCw, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setCount(data.count || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <TicketIcon size={16} className="text-purple-600" />;
      case "task":
        return <ListTodo size={16} className="text-blue-600" />;
      case "quotation":
        return <FileText size={16} className="text-amber-600" />;
      case "invoice":
        return <Receipt size={16} className="text-emerald-600" />;
      default:
        return <Bell size={16} className="text-slate-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "ticket":
        return "bg-purple-50 border-purple-100";
      case "task":
        return "bg-blue-50 border-blue-100";
      case "quotation":
        return "bg-amber-50 border-amber-100";
      case "invoice":
        return "bg-emerald-50 border-emerald-100";
      default:
        return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-500 hover:text-blue-600 transition-colors p-2.5 rounded-full hover:bg-blue-50/80 cursor-pointer"
        title="الإشعارات والتنبيهات"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            {count > 9 ? "+9" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              <h3 className="font-bold text-sm">مركز الإشعارات والتنبيهات</h3>
              {count > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {count} تنبيه
                </span>
              )}
            </div>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer"
              title="تحديث"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <CheckCircle size={36} className="text-emerald-500" />
                <p className="font-bold text-sm text-slate-700">كل شيء على ما يرام!</p>
                <p className="text-xs text-slate-400">لا توجد مهام أو تذاكر أو فواتير معلقة حالياً.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors block group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getBgColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDistanceToNow(new Date(n.time), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate leading-relaxed">{n.description}</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0 mt-1" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
