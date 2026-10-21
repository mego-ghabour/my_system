"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, ListTodo, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });
      const savedTask = await res.json();
      setTasks([savedTask, ...tasks]);
      setNewTask("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
    } catch (err) {
      // Revert if failed
      setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const prevTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      setTasks(prevTasks);
    }
  };

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <ListTodo className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              مهام اليوم
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-gray-500 font-medium mt-1">نظّم وقتك وسجل المهام التي يجب إنجازها اليوم بكل سهولة.</p>
          </div>
        </div>

        <div className="relative z-10 bg-orange-50 border border-orange-100 text-orange-700 px-6 py-3 rounded-2xl font-bold flex flex-col items-center justify-center min-w-[120px]">
          <span className="text-2xl">{pendingCount}</span>
          <span className="text-xs">مهمة متبقية</span>
        </div>
      </div>

      {/* Add Task Form */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white animate-in slide-in-from-bottom-4 delay-100">
        <CardContent className="p-6">
          <form onSubmit={handleAddTask} className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                placeholder="ما الذي تود إنجازه اليوم؟ (مثال: تجهيز المتجر الإلكتروني لعميل...)" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="h-14 px-6 bg-slate-50 border-slate-200 text-lg rounded-2xl focus-visible:ring-orange-500 transition-all pr-12"
              />
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
            </div>
            <Button 
              type="submit" 
              disabled={!newTask.trim()}
              className="h-14 px-8 gap-2 bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 font-bold disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Plus size={20} /> إضافة
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 delay-200 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="font-medium">جاري تحميل المهام...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-orange-50 text-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ListTodo size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">قائمة المهام فارغة 🎉</h3>
            <p className="text-slate-500">رائع! لقد أنجزت كل شيء. أضف مهام جديدة لبدء العمل.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 group ${
                  task.completed 
                    ? "bg-slate-50 border-slate-100 opacity-60 hover:opacity-100" 
                    : "bg-white border-transparent shadow-sm hover:border-orange-100 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    className={`w-7 h-7 rounded-full transition-colors ${task.completed ? 'data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-400' : 'data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'}`}
                  />
                  <label 
                    htmlFor={`task-${task.id}`} 
                    className={`text-lg cursor-pointer flex-1 transition-all ${
                      task.completed ? "line-through text-slate-400" : "text-slate-800 font-bold"
                    }`}
                  >
                    {task.title}
                  </label>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all h-10 w-10" 
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash size={20} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
