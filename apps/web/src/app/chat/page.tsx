"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Bot, User, Sparkles } from "lucide-react";
import { Card } from "@/components/card";
import { Sidebar, MobileNav } from "@/components/nav";
import { chat, type ChatMessage, CHAT_MODELS } from "@/lib/ai/chat";
import { getAll, add, remove } from "@/lib/storage";
import { toast } from "@/lib/toast";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gemini-2.0-flash");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    const res = await chat({ messages: updated, model });
    if (res.error) { toast.error(res.error); setLoading(false); return; }
    const assistantMsg: ChatMessage = { role: "assistant", content: res.content || "" };
    setMessages([...updated, assistantMsg]);
    setLoading(false);
  };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">AI Chat</h1>
              <select value={model} onChange={(e) => setModel(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm text-zinc-100">
                {Object.entries(CHAT_MODELS).flatMap(([prov, models]) =>
                  models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)
                )}
              </select>
            </div>

            {messages.length === 0 && (
              <Card className="text-center py-12">
                <Bot className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-zinc-400">Mulai percakapan dengan AI</p>
                <p className="text-xs text-zinc-600 mt-1">Gratis, tanpa login</p>
              </Card>
            )}

            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-purple-400" /></div>}
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    m.role === "user" ? "bg-purple-600 text-white" : "bg-zinc-800/50 text-zinc-200 border border-zinc-800"
                  }`}>{m.content}</div>
                  {m.role === "user" && <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-indigo-400" /></div>}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-400" /></div>
                  <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                    <span className="flex gap-1"><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" /><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100" /><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200" /></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        <div className="fixed bottom-16 md:bottom-0 md:pl-64 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ketik pesan..." disabled={loading}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            <button onClick={send} disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-500 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
