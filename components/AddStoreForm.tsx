"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AddStoreForm({ clientId, platforms = [] }: { clientId: string; platforms?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Custom Combo Box State
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Platforms
  const [predefinedPlatforms, setPredefinedPlatforms] = useState<string[]>(
    platforms && platforms.length > 0 ? platforms.map(p => typeof p === "string" ? p : p.name) : []
  );

  const [formData, setFormData] = useState({
    name: "",
    platformName: "",
    storeLink: "",
    platformEmail: "",
    platformPassword: "",
  });

  const filteredPlatforms = predefinedPlatforms.filter(p => p.toLowerCase().includes(formData.platformName.toLowerCase()));

  useEffect(() => {
    if (open && predefinedPlatforms.length === 0) {
      fetch("/api/settings/platforms")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPredefinedPlatforms(data.map(p => p.name));
          }
        })
        .catch(console.error);
    }
  }, [open, predefinedPlatforms.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${clientId}/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("تم إضافة المتجر بنجاح!");
        setFormData({ name: "", platformName: "", storeLink: "", platformEmail: "", platformPassword: "" });
        setOpen(false);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء إضافة المتجر.");
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
        <DialogTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 gap-2 cursor-pointer shadow-sm">
          <Plus size={16} /> إضافة متجر إلكتروني
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة متجر جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-4">
            <Input
              placeholder="اسم المتجر (مثال: متجر الأناقة)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-11"
            />
            
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Input
                  placeholder="المنصة (اختر أو اكتب منصة جديدة)"
                  value={formData.platformName}
                  onChange={(e) => {
                    setFormData({ ...formData, platformName: e.target.value });
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  required
                  className="h-11 pr-10"
                />
                <ChevronDown 
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform cursor-pointer ${showDropdown ? "rotate-180" : ""}`} 
                  size={18} 
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              </div>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredPlatforms.length > 0 ? (
                    filteredPlatforms.map((platform, idx) => (
                      <div 
                        key={idx}
                        className="px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, platformName: platform });
                          setShowDropdown(false);
                        }}
                      >
                        {platform}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      سيتم استخدام "{formData.platformName}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              placeholder="رابط المتجر (اختياري)"
              value={formData.storeLink}
              onChange={(e) => setFormData({ ...formData, storeLink: e.target.value })}
              dir="ltr"
              className="text-right h-11"
            />
            <Input
              placeholder="إيميل الدخول (اختياري)"
              value={formData.platformEmail}
              onChange={(e) => setFormData({ ...formData, platformEmail: e.target.value })}
              dir="ltr"
              className="text-right h-11"
            />
            <Input
              placeholder="كلمة المرور (اختياري)"
              value={formData.platformPassword}
              onChange={(e) => setFormData({ ...formData, platformPassword: e.target.value })}
              dir="ltr"
              className="text-right h-11"
            />
          </div>
          <Button type="submit" disabled={loading || !formData.name || !formData.platformName} size="sm" className="w-full h-12 mt-2 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            حفظ وإضافة المتجر
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
