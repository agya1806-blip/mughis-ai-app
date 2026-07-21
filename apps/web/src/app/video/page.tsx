"use client";
import { useState, useRef } from "react";
import { Sparkles, Download, RefreshCw, Trash2, Clock, StopCircle, Video as VideoIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Textarea } from "@/components/input";
import { Sidebar, MobileNav } from "@/components/nav";
import { generateVideo, VIDEO_MODELS } from "@/lib/ai";
import { getAll, add, remove } from "@/lib/storage";
import { toast } from "@/lib/toast";

export default function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(VIDEO_MODELS.huggingface[0].value);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState(getAll("video"));
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Masukkan prompt"); return; }
    setGenerating(true);
    setResult(null);
    abortRef.current = new AbortController();
    const res = await generateVideo({ prompt: prompt.trim(), model, signal: abortRef.current.signal });
    if (res.error) { toast.error(res.error); setGenerating(false); return; }
    if (!res.data) { toast.error("Tidak ada hasil"); setGenerating(false); return; }
    const url = URL.createObjectURL(res.data);
    add("video", { prompt: prompt.trim(), url, model });
    setResult(url);
    setHistory(getAll("video"));
    setGenerating(false);
    toast.success("Video selesai!");
  };

  const cancel = () => { abortRef.current?.abort(); setGenerating(false); };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-xl font-bold text-white">Buat Video</h1>

          <Card className="space-y-4">
            <Textarea value={prompt} onChange={setPrompt} placeholder="Jelaskan video yang ingin dibuat..." />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100">
                {Object.entries(VIDEO_MODELS).flatMap(([prov, models]) =>
                  models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)
                )}
              </select>
            </div>

            <Button onClick={generating ? cancel : handleGenerate} className="w-full" size="lg" variant="secondary">
              {generating ? <><StopCircle className="w-4 h-4" /> Batal</> : <><Sparkles className="w-4 h-4" /> Buat Video</>}
            </Button>
          </Card>

          {result && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>Hasil</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { const a = document.createElement("a"); a.href = result; a.download = `mughis-${Date.now()}.mp4`; a.click(); }}>
                  <Download className="w-3 h-3" />
                </Button>
              </div>
              <video src={result} controls className="w-full rounded-xl border border-zinc-700" />
            </Card>
          )}

          {history.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-indigo-400" />
                <CardTitle>Riwayat</CardTitle>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    {item.url ? (
                      <video src={item.url} className="w-full aspect-square object-cover" onClick={() => setResult(item.url || null)} />
                    ) : (
                      <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center"><VideoIcon className="w-6 h-6 text-zinc-600" /></div>
                    )}
                    <button onClick={() => { remove("video", item.id); setHistory(getAll("video")); }}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
