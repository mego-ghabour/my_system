"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, RotateCcw, PenTool, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SignaturePad({
  onSign,
  loading = false,
}: {
  onSign: (signatureData: string, signerName: string) => Promise<void>;
  loading?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 180;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a"; // slate-900
  }, []);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async () => {
    if (!signerName.trim()) {
      toast.error("يرجى كتابة الاسم الكامل للمفوض بالتوقيع");
      return;
    }
    if (!hasDrawn || !canvasRef.current) {
      toast.error("يرجى رسم التوقيع داخل المربع المخصص");
      return;
    }

    const signatureData = canvasRef.current.toDataURL("image/png");
    await onSign(signatureData, signerName);
  };

  return (
    <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-800">الاسم الكامل للموقع <span className="text-red-500">*</span></Label>
        <Input 
          placeholder="اكتب اسمك الثلاثي أو اسم المنشأة..." 
          value={signerName} 
          onChange={(e) => setSignerName(e.target.value)}
          className="h-12 rounded-xl bg-white text-sm border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <PenTool size={16} className="text-blue-600" />
            التوقيع الإلكتروني (بالإصبع أو الماوس) <span className="text-red-500">*</span>
          </Label>
          {hasDrawn && (
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw size={12} /> مسح وإعادة
            </button>
          )}
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden relative touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full cursor-crosshair block"
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none text-sm font-bold">
              وقع هنا
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !hasDrawn || !signerName.trim()}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-emerald-600/20 cursor-pointer text-md"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
          {loading ? "جاري توثيق التوقيع..." : "اعتماد وتوقيع العقد إلكترونياً"}
        </Button>
      </div>
    </div>
  );
}
