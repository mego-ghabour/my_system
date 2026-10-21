"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Send, Copy, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX, UserCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function AIAssistantChat() {
  const { data: session } = useSession();
  
  // Initialize from localStorage if available
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: "ai", content: "مرحباً! أنا مساعدك الذكي المربوط بقاعدة بياناتك. يمكنك سؤالي عن الفواتير، الديون، العملاء، أو تذاكر الدعم الفني، ويمكنك أن تطلب مني إضافة مهام أو عملاء. كيف يمكنني مساعدتك اليوم؟" }
      ]);
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);
  
  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // <-- Make it listen continuously
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setPrompt(prev => prev + " " + finalTranscript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      // Removed onend so it doesn't arbitrarily stop listening if not explicitly stopped
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // setPrompt(""); // <-- Removed! Now it will append instead of clearing.
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakResponse = (textToSpeak: string) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const plainText = textToSpeak.replace(/[#*_]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'ar-SA';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const userText = prompt;
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setPrompt("");
    setLoading(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 400 && errorText.includes("configured")) {
           setMessages(prev => [...prev, { role: "ai", content: "⚠️ لم يتم إعداد مفتاح API الخاص بـ Gemini. يرجى إضافته في الإعدادات." }]);
        } else {
           setMessages(prev => [...prev, { role: "ai", content: `❌ خطأ من الخادم: ${errorText}` }]);
        }
        return;
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
      speakResponse(data.text);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "❌ تعذر الاتصال بالخادم." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ بنجاح!");
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 flex items-center justify-between mb-6 shrink-0">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30 backdrop-blur-sm shadow-inner">
            <Bot size={30} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              المساعد الذكي (AI Assistant)
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium opacity-90">مربوط مباشرة بقاعدة بياناتك للإجابة على استفساراتك وتنفيذ أوامرك.</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {isSpeaking && (
            <Button variant="ghost" onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="text-red-400 hover:text-red-300 hover:bg-white/10 rounded-xl h-10 px-3 cursor-pointer">
              <VolumeX size={18} className="ml-1.5"/> إيقاف النطق
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={() => {
              if (confirm("هل أنت متأكد من مسح المحادثة؟")) {
                localStorage.removeItem("ai_chat_history");
                setMessages([{ role: "ai", content: "مرحباً! كيف يمكنني مساعدتك اليوم؟" }]);
              }
            }} 
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl h-10 px-4 text-xs font-bold border border-white/10 backdrop-blur-sm cursor-pointer"
          >
            مسح المحادثة
          </Button>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border ${msg.role === 'user' ? 'bg-slate-100 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              {msg.role === 'user' ? (
                session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-slate-400" />
              ) : (
                <Sparkles size={20} />
              )}
            </div>

            {/* Bubble */}
            <div className={`group relative max-w-[80%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tl-none shadow-md' : 'bg-white border border-slate-100 rounded-tr-none shadow-sm'}`}>
              <div className={`prose ${msg.role === 'user' ? 'text-white' : 'prose-slate'} rtl:prose-p:text-right max-w-none text-[15px] leading-relaxed`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              
              {/* Actions for AI */}
              {msg.role === 'ai' && (
                <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  <button onClick={() => copyText(msg.content)} className="p-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 hover:text-blue-600">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => speakResponse(msg.content)} className="p-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 hover:text-blue-600">
                    <Volume2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-none p-5 shadow-sm flex items-center gap-2">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-sm text-slate-500">جاري التفكير...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-end gap-2 relative">
        <Button 
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          className={`shrink-0 rounded-xl h-12 w-12 mb-1 ${isListening ? 'bg-red-100 text-red-600 animate-pulse hover:bg-red-200' : 'text-slate-400 hover:text-blue-600'}`}
        >
          {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        </Button>

        <textarea
          rows={1}
          className="flex-1 bg-transparent py-4 px-2 text-[15px] focus:outline-none resize-none max-h-32 min-h-[56px]"
          placeholder="اسأل الذكاء الاصطناعي عن عملائك أو بياناتك..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button 
          onClick={handleGenerate} 
          disabled={loading || !prompt.trim()} 
          className="shrink-0 bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-xl text-white mb-1"
        >
          <Send size={20} className="rtl:-scale-x-100" />
        </Button>
      </div>
    </div>
  );
}
